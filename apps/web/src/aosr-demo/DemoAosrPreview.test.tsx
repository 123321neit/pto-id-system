// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DemoAosrPreview } from './DemoAosrPreview.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

const previewMocks = vi.hoisted(() => ({
  generateAosrDocxBlob: vi.fn(),
  renderAsync: vi.fn(),
}));

vi.mock('./aosr-docx-generator.js', () => ({
  generateAosrDocxBlob: previewMocks.generateAosrDocxBlob,
}));

vi.mock('docx-preview', () => ({
  renderAsync: previewMocks.renderAsync,
}));

beforeEach(() => {
  previewMocks.generateAosrDocxBlob.mockReset();
  previewMocks.renderAsync.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe('DemoAosrPreview', () => {
  it('generates a DOCX blob and publishes the rendered result only after renderAsync completes', async () => {
    const printState = createPrintState('ОВ-77');
    const docxBlob = new Blob(['docx-preview']);

    previewMocks.generateAosrDocxBlob.mockResolvedValue(docxBlob);
    previewMocks.renderAsync.mockImplementation(
      async (_blob: Blob, bodyContainer: HTMLElement): Promise<void> => {
        const renderedPage = document.createElement('article');
        renderedPage.dataset['renderedDocx'] = 'ready';
        renderedPage.textContent = 'Содержимое DOCX';
        bodyContainer.append(renderedPage);
      },
    );

    render(<DemoAosrPreview printState={printState} />);

    expect(screen.getByRole('status').textContent).toContain(
      'Готовим предпросмотр из DOCX-шаблона',
    );

    const previewHost = screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР');
    await waitFor(() => {
      expect(previewHost.querySelector('[data-rendered-docx="ready"]')).not.toBeNull();
    });

    expect(previewMocks.generateAosrDocxBlob).toHaveBeenCalledWith(printState);
    expect(previewMocks.renderAsync).toHaveBeenCalledTimes(1);
    const renderCall = previewMocks.renderAsync.mock.calls[0];

    expect(renderCall?.[0]).toBe(docxBlob);
    expect(renderCall?.[1]).toBeInstanceOf(HTMLElement);
    expect(renderCall?.[2]).toBe(renderCall?.[1]);
    expect(renderCall?.[1]).not.toBe(previewHost);
    expect(renderCall?.[3]).toMatchObject({
      breakPages: true,
      className: 'aosr-docx',
      experimental: true,
      inWrapper: true,
      renderFooters: true,
      renderHeaders: true,
    });
    expect(previewHost.closest('[data-status]')?.getAttribute('data-status')).toBe('ready');
    expect(document.querySelector('.act-page')).toBeNull();
  });

  it('keeps only the loading state while DOCX generation is pending', () => {
    previewMocks.generateAosrDocxBlob.mockReturnValue(createDeferred<Blob>().promise);

    render(<DemoAosrPreview printState={createPrintState('ОВ-1')} />);

    expect(screen.getByRole('status').textContent).toContain(
      'Готовим предпросмотр из DOCX-шаблона',
    );
    expect(screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР').childNodes).toHaveLength(0);
    expect(document.querySelector('.act-page')).toBeNull();
  });

  it('clears an older visible render when the next DOCX preview fails', async () => {
    const renderingError = new Error('DOCX preview failed');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    previewMocks.generateAosrDocxBlob.mockResolvedValueOnce(new Blob(['first']));
    previewMocks.renderAsync.mockImplementationOnce(
      async (_blob: Blob, bodyContainer: HTMLElement): Promise<void> => {
        bodyContainer.textContent = 'Старое содержимое';
      },
    );

    const { rerender } = render(<DemoAosrPreview printState={createPrintState('ОВ-1')} />);
    const previewHost = screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР');

    await waitFor(() => {
      expect(previewHost.textContent).toBe('Старое содержимое');
    });

    previewMocks.generateAosrDocxBlob.mockRejectedValueOnce(renderingError);
    rerender(<DemoAosrPreview printState={createPrintState('ОВ-2')} />);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toBe(
        'Не удалось показать предпросмотр DOCX. Скачайте DOCX и проверьте файл.',
      );
    });
    expect(previewHost.childNodes).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'AOSR DOCX preview rendering failed',
      renderingError,
    );
    expect(document.querySelector('.act-page')).toBeNull();
  });

  it('does not let a stale asynchronous render replace the current DOCX preview', async () => {
    const firstRender = createDeferred<void>();
    const firstBlob = new Blob(['first']);
    const secondBlob = new Blob(['second']);

    previewMocks.generateAosrDocxBlob.mockImplementation(
      async (printState: AosrPrintState): Promise<Blob> =>
        printState.document.number === 'ОВ-1' ? firstBlob : secondBlob,
    );
    previewMocks.renderAsync.mockImplementation(
      async (blob: Blob, bodyContainer: HTMLElement): Promise<void> => {
        bodyContainer.textContent = blob === firstBlob ? 'Устаревший DOCX' : 'Текущий DOCX';

        if (blob === firstBlob) {
          await firstRender.promise;
        }
      },
    );

    const { rerender } = render(<DemoAosrPreview printState={createPrintState('ОВ-1')} />);
    await waitFor(() => {
      expect(previewMocks.renderAsync).toHaveBeenCalledTimes(1);
    });

    rerender(<DemoAosrPreview printState={createPrintState('ОВ-2')} />);
    const previewHost = screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР');

    await waitFor(() => {
      expect(previewHost.textContent).toBe('Текущий DOCX');
    });

    await act(async () => {
      firstRender.resolve(undefined);
      await firstRender.promise;
    });

    expect(previewHost.textContent).toBe('Текущий DOCX');
    expect(previewHost.textContent).not.toContain('Устаревший DOCX');
  });

  it('invalidates pending generation when the preview unmounts', async () => {
    const generation = createDeferred<Blob>();
    previewMocks.generateAosrDocxBlob.mockReturnValue(generation.promise);

    const { unmount } = render(<DemoAosrPreview printState={createPrintState('ОВ-1')} />);
    const previewHost = screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР');

    unmount();

    await act(async () => {
      generation.resolve(new Blob(['late']));
      await generation.promise;
      await Promise.resolve();
    });

    expect(previewHost.isConnected).toBe(false);
    expect(previewHost.childNodes).toHaveLength(0);
    expect(previewMocks.renderAsync).not.toHaveBeenCalled();
  });
});

function createPrintState(number: string): AosrPrintState {
  return {
    applications: { items: [] },
    confirmationDocuments: { items: [] },
    counterparties: [],
    document: {
      additionalInfo: '',
      copiesLine: '2',
      date: '2026-06-17',
      number,
    },
    materials: { items: [] },
    object: {
      name: 'Тестовый объект',
      nameSubscript: 'Подстрочник объекта',
    },
    project: {
      compliance: 'Тестовое соответствие',
      documentation: 'Тестовая документация',
    },
    representatives: { groups: [] },
    work: {
      contractorName: 'ООО "Монтаж"',
      description: 'Монтаж воздуховодов',
      endDateLine: '2026-09-03',
      nextWorks: 'изоляции воздуховодов',
      startDateLine: '2026-09-01',
    },
  };
}

function createDeferred<T>(): {
  readonly promise: Promise<T>;
  readonly reject: (reason?: unknown) => void;
  readonly resolve: (value: T | PromiseLike<T>) => void;
} {
  let rejectPromise: (reason?: unknown) => void = () => undefined;
  let resolvePromise: (value: T | PromiseLike<T>) => void = () => undefined;
  const promise = new Promise<T>((resolve, reject) => {
    rejectPromise = reject;
    resolvePromise = resolve;
  });

  return {
    promise,
    reject: rejectPromise,
    resolve: resolvePromise,
  };
}
