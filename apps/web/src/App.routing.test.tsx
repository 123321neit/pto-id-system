// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App.js';
import type { AosrPrintState } from './aosr-demo/demo-aosr-workspace.js';

const previewMocks = vi.hoisted(() => ({
  downloadAosrDocx: vi.fn(),
  generateAosrDocxBlob: vi.fn<(printState: AosrPrintState) => Promise<Blob>>(),
  renderAsync: vi.fn(),
}));

vi.mock('./aosr-demo/aosr-docx-generator.js', () => ({
  downloadAosrDocx: previewMocks.downloadAosrDocx,
  generateAosrDocxBlob: previewMocks.generateAosrDocxBlob,
}));

vi.mock('docx-preview', () => ({ renderAsync: previewMocks.renderAsync }));

const NativeRequest = globalThis.Request;

class RouterCompatibleRequest extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const routerInit = init === undefined ? undefined : { ...init };
    if (routerInit !== undefined) {
      delete routerInit.signal;
    }
    super(input, routerInit);
  }
}

vi.stubGlobal('Request', RouterCompatibleRequest);

beforeEach(() => {
  previewMocks.generateAosrDocxBlob.mockResolvedValue(new Blob(['mock AOSR DOCX']));
  previewMocks.renderAsync.mockImplementation(
    (_blob: Blob, bodyContainer: HTMLElement): Promise<void> => {
      bodyContainer.textContent = 'DOCX preview';
      return Promise.resolve();
    },
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const objectId = 'object-polyclinic-demo';
const sectionId = 'section-ventilation';
const heatingSectionId = 'section-heating';
const folderId = 'folder-2026-09';
const octoberFolderId = 'folder-2026-10';
const draftId = 'aosr-draft-001';

describe('application routes', () => {
  it.each([
    ['/objects', 'ИДея — рабочее место ПТО для исполнительной документации'],
    ['/certificates', 'Библиотека сертификатов'],
    ['/organizations', 'Представители и организации'],
    [`/objects/${objectId}`, 'Обзор объекта'],
    [`/objects/${objectId}/documents`, 'Документы объекта'],
    [`/objects/${objectId}/sections`, 'Разделы исполнительной документации'],
    [`/objects/${objectId}/sections/${sectionId}`, 'Вентиляция'],
    [`/objects/${objectId}/sections/${sectionId}/template`, 'Шаблонные значения'],
    [`/objects/${objectId}/sections/${sectionId}/final`, 'Итоговая ИД по разделу: Вентиляция'],
    [`/objects/${objectId}/sections/${sectionId}/folders/${folderId}`, 'Сентябрь 2026'],
    [`/objects/${objectId}/sections/${sectionId}/folders/${folderId}/aosr/${draftId}`, 'ОВ-1'],
  ])('renders a direct route %s', (path, expectedText) => {
    renderAppAt(path);
    expect(screen.getAllByText(expectedText, { exact: false }).length).toBeGreaterThan(0);
    expect(window.location.pathname).toBe(path);
  });

  it('replaces the root URL with the canonical objects route', async () => {
    const historyLength = window.history.length;
    renderAppAt('/');

    await waitFor(() => {
      expect(window.location.pathname).toBe('/objects');
    });
    expect(window.history.length).toBe(historyLength);
  });

  it.each([
    ['/objects/object-missing', 'Объект не найден'],
    [`/objects/${objectId}/sections/section-missing`, 'Раздел ИД не найден'],
    ['/objects/object-empty-demo/sections/section-ventilation', 'Раздел ИД не найден'],
    [`/objects/${objectId}/sections/section-heating/folders/${folderId}`, 'Папка ИД не найдена'],
    [
      `/objects/${objectId}/sections/${sectionId}/folders/folder-2026-10/aosr/${draftId}`,
      'АОСР не найден',
    ],
    ['/unknown-product-route', 'Страница не найдена'],
  ])('keeps an invalid route visible and offers safe navigation for %s', (path, title) => {
    renderAppAt(path);
    expect(screen.getByRole('heading', { name: title })).toBeTruthy();
    expect(window.location.pathname).toBe(path);
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('derives global navigation and active state from the current URL', async () => {
    const user = userEvent.setup();
    renderAppAt('/certificates');
    const navigation = screen.getByRole('navigation', { name: 'Основная навигация' });
    const certificates = within(navigation).getByRole('link', {
      name: /Библиотека сертификатов/u,
    });
    expect(certificates.getAttribute('href')).toBe('/certificates');
    expect(certificates.getAttribute('aria-current')).toBe('page');

    await user.click(
      within(navigation).getByRole('link', { name: /Представители и организации/u }),
    );
    expect(window.location.pathname).toBe('/organizations');
    expect(
      within(navigation)
        .getByRole('link', { name: /Представители и организации/u })
        .getAttribute('aria-current'),
    ).toBe('page');
  });

  it('uses the actual browser history for object, section, folder and act navigation', async () => {
    const user = userEvent.setup();
    renderAppAt('/objects');

    await user.click(getRequiredElement(screen.getAllByRole('link', { name: 'Открыть объект' })));
    await user.click(screen.getByRole('link', { name: 'Открыть раздел Вентиляция' }));
    await user.click(
      getRequiredElement(screen.getAllByRole('link', { name: 'Открыть папку Сентябрь 2026' })),
    );
    await user.click(screen.getByRole('link', { name: 'Открыть АОСР ОВ-1' }));
    expect(window.location.pathname).toBe(
      `/objects/${objectId}/sections/${sectionId}/folders/${folderId}/aosr/${draftId}`,
    );

    act(() => {
      window.history.back();
    });
    await waitFor(() => {
      expect(window.location.pathname).toBe(
        `/objects/${objectId}/sections/${sectionId}/folders/${folderId}`,
      );
    });

    act(() => {
      window.history.back();
    });
    await waitFor(() => {
      expect(window.location.pathname).toBe(`/objects/${objectId}/sections/${sectionId}`);
    });

    act(() => {
      window.history.forward();
    });
    await waitFor(() => {
      expect(window.location.pathname).toBe(
        `/objects/${objectId}/sections/${sectionId}/folders/${folderId}`,
      );
    });

    act(() => {
      window.history.forward();
    });
    await waitFor(() => {
      expect(window.location.pathname).toContain(`/aosr/${draftId}`);
    });
  });

  it('does not add history for a local folder form and clears its section-owned state', async () => {
    const user = userEvent.setup();
    const heatingPath = `/objects/${objectId}/sections/${heatingSectionId}`;
    const ventilationPath = `/objects/${objectId}/sections/${sectionId}`;
    renderAppAt(heatingPath);

    await user.click(screen.getByRole('link', { name: 'Открыть раздел Вентиляция' }));
    expect(window.location.pathname).toBe(ventilationPath);

    const historyLength = window.history.length;
    await user.click(screen.getByRole('button', { name: 'Создать папку' }));
    expect(window.location.pathname).toBe(ventilationPath);
    expect(window.history.length).toBe(historyLength);

    await user.type(screen.getByLabelText('Название папки'), 'Черновик из Вентиляции');
    expect(screen.getByDisplayValue('Черновик из Вентиляции')).toBeTruthy();

    act(() => {
      window.history.back();
    });
    await waitFor(() => {
      expect(window.location.pathname).toBe(heatingPath);
      expect(screen.queryByRole('form', { name: 'Создать папку ИД' })).toBeNull();
    });
    expect(screen.queryByDisplayValue('Черновик из Вентиляции')).toBeNull();

    act(() => {
      window.history.forward();
    });
    await waitFor(() => {
      expect(window.location.pathname).toBe(ventilationPath);
      expect(screen.queryByRole('form', { name: 'Создать папку ИД' })).toBeNull();
    });
  });

  it('clears folder-owned create UI when Back changes the folder owner', async () => {
    const user = userEvent.setup();
    const septemberPath = `/objects/${objectId}/sections/${sectionId}/folders/${folderId}`;
    const octoberPath = `/objects/${objectId}/sections/${sectionId}/folders/${octoberFolderId}`;
    renderAppAt(septemberPath);

    await user.click(getRequiredElement(screen.getAllByRole('button', { name: 'Создать акт' })));
    expect(screen.getByRole('dialog', { name: 'Создание акта' })).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Открыть папку Октябрь 2026' }));
    expect(window.location.pathname).toBe(octoberPath);
    expect(screen.queryByRole('dialog', { name: 'Создание акта' })).toBeNull();

    act(() => {
      window.history.back();
    });
    await waitFor(() => {
      expect(window.location.pathname).toBe(septemberPath);
    });
    expect(screen.queryByRole('dialog', { name: 'Создание акта' })).toBeNull();
  });

  it('exposes canonical hrefs and URL-driven active state for section, folder and act links', () => {
    const actPath = `/objects/${objectId}/sections/${sectionId}/folders/${folderId}/aosr/${draftId}`;
    renderAppAt(actPath);
    const navigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    const sectionLink = within(navigation).getByRole('link', {
      name: 'Открыть раздел Вентиляция',
    });
    const folderLink = within(navigation).getByRole('link', {
      name: 'Открыть папку Сентябрь 2026',
    });
    const actLink = within(navigation).getByRole('link', { name: 'Открыть АОСР ОВ-1' });

    expect(sectionLink.getAttribute('href')).toBe(`/objects/${objectId}/sections/${sectionId}`);
    expect(folderLink.getAttribute('href')).toBe(
      `/objects/${objectId}/sections/${sectionId}/folders/${folderId}`,
    );
    expect(actLink.getAttribute('href')).toBe(actPath);
    expect(folderLink.getAttribute('aria-current')).toBe('page');
    expect(actLink.getAttribute('aria-current')).toBe('page');
  });

  it('renders named clickable breadcrumbs without raw route IDs', async () => {
    const user = userEvent.setup();
    const actPath = `/objects/${objectId}/sections/${sectionId}/folders/${folderId}/aosr/${draftId}`;
    renderAppAt(actPath);
    const breadcrumbs = screen.getByRole('navigation', { name: 'Хлебные крошки' });

    expect(breadcrumbs.textContent).toContain('Объекты');
    expect(breadcrumbs.textContent).toContain('Реконструкция поликлиники');
    expect(breadcrumbs.textContent).toContain('Вентиляция');
    expect(breadcrumbs.textContent).toContain('Сентябрь 2026');
    expect(breadcrumbs.textContent).toContain('АОСР ОВ-1');
    expect(breadcrumbs.textContent).not.toContain(objectId);
    expect(breadcrumbs.textContent).not.toContain(sectionId);

    await user.click(within(breadcrumbs).getByRole('link', { name: 'Сентябрь 2026' }));
    expect(window.location.pathname).toBe(
      `/objects/${objectId}/sections/${sectionId}/folders/${folderId}`,
    );
  });

  it('keeps the folder act list available and route-driven in DOCX preview', async () => {
    const user = userEvent.setup();
    renderAppAt(`/objects/${objectId}/sections/${sectionId}/folders/${folderId}/aosr/${draftId}`);

    await user.click(getRequiredElement(screen.getAllByRole('button', { name: /Дублировать/u })));
    await waitFor(() => {
      expect(window.location.pathname).toContain('/aosr/aosr-draft-duplicate-1');
    });
    await user.click(screen.getByRole('button', { name: 'Предпросмотр' }));
    expect(screen.getByRole('heading', { name: 'Предпросмотр акта' })).toBeTruthy();

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    const originalActLink = within(objectNavigation).getByRole('link', {
      name: 'Открыть АОСР ОВ-1',
    });
    expect(originalActLink.getAttribute('href')).toBe(
      `/objects/${objectId}/sections/${sectionId}/folders/${folderId}/aosr/${draftId}`,
    );
    await user.click(originalActLink);

    expect(window.location.pathname).toContain(`/aosr/${draftId}`);
    expect(screen.getByRole('heading', { name: 'Предпросмотр акта' })).toBeTruthy();
    expect(
      within(objectNavigation)
        .getByRole('link', { name: 'Открыть АОСР ОВ-1' })
        .getAttribute('aria-current'),
    ).toBe('page');
    await waitFor(() => {
      const latestPrintState = previewMocks.generateAosrDocxBlob.mock.calls.at(-1)?.[0];
      expect(latestPrintState?.document.number).toBe('ОВ-1');
    });
  });
});

function renderAppAt(path: string): void {
  window.history.replaceState(null, '', path);
  render(<App />);
}

function getRequiredElement(elements: readonly HTMLElement[]): HTMLElement {
  const element = elements[0];

  if (element === undefined) {
    throw new Error('Expected at least one matching element.');
  }

  return element;
}
