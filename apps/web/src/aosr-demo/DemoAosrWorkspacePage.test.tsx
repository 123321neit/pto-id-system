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
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Черновики актов' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Данные акта освидетельствования' })).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Акт освидетельствования скрытых работ' }),
    ).toBeTruthy();
    expect(screen.getByDisplayValue('АОСР-001')).toBeTruthy();
  });

  it('updates the conceptual preview when a user edits a field', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Концептуальный предпросмотр АОСР');
    const actNumberInput = screen.getByRole('textbox', { name: 'Номер акта' });
    const workDescriptionInput = screen.getByRole('textbox', {
      name: 'Описание скрытых работ',
    });

    await user.clear(actNumberInput);
    await user.type(actNumberInput, 'АОСР-777');
    await user.clear(workDescriptionInput);
    await user.type(workDescriptionInput, 'Проверены скрытые крепления воздуховодов.');

    expect(within(preview).getByText('АОСР-777 от 2026-06-01')).toBeTruthy();
    expect(preview.textContent).toContain('Проверены скрытые крепления воздуховодов.');
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
