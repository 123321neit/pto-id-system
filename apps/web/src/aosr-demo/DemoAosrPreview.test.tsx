// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAosrPreview } from './DemoAosrPreview.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrPreview', () => {
  it('renders only the DOCX preview host in normal mode', () => {
    render(<DemoAosrPreview printState={createPrintState([])} />);

    expect(screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР')).toBeTruthy();
    expect(screen.queryByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeNull();
    expect(screen.queryByLabelText('Тестовый HTML fallback АОСР')).toBeNull();
    expect(document.querySelector('.act-page')).toBeNull();
    expect(document.querySelector('.act-page__signature-line-row')).toBeNull();
    expect(document.body.textContent).not.toContain('5.Даты:');
  });

  it('shows loading status without rendering a manual HTML act', () => {
    render(<DemoAosrPreview printState={createPrintState([])} testOnlyPreviewStatus="loading" />);

    expect(screen.getByRole('status').textContent).toContain(
      'Готовим предпросмотр из DOCX-шаблона',
    );
    expect(screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР')).toBeTruthy();
    expect(document.querySelector('.act-page')).toBeNull();
  });

  it('shows a DOCX preview error without rendering a fake HTML preview', () => {
    render(<DemoAosrPreview printState={createPrintState([])} testOnlyPreviewStatus="error" />);

    expect(screen.getByRole('alert').textContent).toBe(
      'Не удалось показать предпросмотр DOCX. Скачайте DOCX и проверьте файл.',
    );
    expect(screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР')).toBeTruthy();
    expect(document.querySelector('.act-page')).toBeNull();
  });
});

function createPrintState(groups: AosrPrintState['representatives']['groups']): AosrPrintState {
  return {
    applications: { items: [] },
    confirmationDocuments: { items: [] },
    counterparties: [],
    document: {
      additionalInfo: '',
      copiesLine: '2',
      date: '2026-06-17',
      number: 'ОВ-77',
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
    representatives: { groups },
    work: {
      contractorName: 'ООО "Монтаж"',
      description: 'Монтаж воздуховодов',
      endDateLine: '2026-09-03',
      nextWorks: 'изоляции воздуховодов',
      startDateLine: '2026-09-01',
    },
  };
}
