// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import {
  buildDemoAosrPreviewLines,
  demoAosrWorkspace,
  updateDemoAosrDraftField,
} from './demo-aosr-workspace.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('renders the Russian mock workspace header, draft list, editable form and preview', () => {
    render(<DemoAosrWorkspacePage />);

    expect(
      screen.getAllByText('ДЕМО / демонстрационные данные / не для работы в продуктиве'),
    ).toHaveLength(2);
    expect(screen.getAllByText('Реконструкция поликлиники, демонстрационный проект')).toHaveLength(
      2,
    );
    expect(screen.getByRole('heading', { name: 'Черновики актов' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Данные акта освидетельствования' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Общие данные акта' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Данные объекта и места работ' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Выполненные скрытые работы' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Проектная документация' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Материалы и сертификаты' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '4. Проектная документация' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '5. Материалы и сертификаты' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Представители / подписанты' })).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Акт освидетельствования скрытых работ' }),
    ).toBeTruthy();
    expect(screen.getByText('Позже здесь будет реальный PDF/печатная форма акта')).toBeTruthy();
    expect(screen.getByDisplayValue('АОСР-001')).toBeTruthy();
  });

  it('updates the document-like preview when a user edits fields', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const actNumberInput = screen.getByRole('textbox', { name: 'Номер акта' });
    const objectInput = screen.getByRole('textbox', { name: 'Объект / участок' });
    const workDescriptionInput = screen.getByRole('textbox', {
      name: 'Описание скрытых работ',
    });
    const materialsInput = screen.getByRole('textbox', {
      name: 'Материалы / сертификаты простым текстом',
    });

    await user.clear(actNumberInput);
    await user.type(actNumberInput, 'АОСР-777');
    await user.clear(objectInput);
    await user.type(objectInput, 'Техподполье, участок ИТП');
    await user.clear(workDescriptionInput);
    await user.type(workDescriptionInput, 'Проверены скрытые крепления воздуховодов.');
    await user.clear(materialsInput);
    await user.type(materialsInput, 'Крепеж КМ-14, сертификат С-777.');

    expect(within(preview).getByText('АОСР-777 от 2026-06-01')).toBeTruthy();
    expect(preview.textContent).toContain('Техподполье, участок ИТП');
    expect(preview.textContent).toContain('Проверены скрытые крепления воздуховодов.');
    expect(preview.textContent).toContain('Крепеж КМ-14, сертификат С-777.');
  });

  it('updates editable act data without mutating the source mock draft', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть черновик.');
    }

    const editedDraft = updateDemoAosrDraftField(
      sourceDraft,
      'workDescription',
      'Проверены скрытые крепления воздуховодов.',
    );

    expect(editedDraft.workDescription).toBe('Проверены скрытые крепления воздуховодов.');
    expect(sourceDraft.workDescription).toBe(
      'Монтаж скрытых участков воздуховодов до закрытия теплоизоляцией и облицовкой.',
    );
    expect(buildDemoAosrPreviewLines(editedDraft)).toContain(
      'Описание скрытых работ: Проверены скрытые крепления воздуховодов.',
    );
  });
});
