// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { cloneElement, type ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { demoAosrFormVariant1 } from '../act-types/act-types.js';
import { DemoAosrPreview } from './DemoAosrPreview.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrPreview', () => {
  it('does not render the manual HTML act in normal DOCX preview mode', () => {
    render(
      <DemoAosrPreview formVariant={demoAosrFormVariant1} printState={createPrintState([])} />,
    );

    expect(screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР')).toBeTruthy();
    expect(screen.queryByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeNull();
    expect(screen.queryByLabelText('Тестовый HTML fallback АОСР')).toBeNull();
    expect(document.querySelector('.act-page')).toBeNull();
    expect(document.querySelector('.act-page__signature-line-row')).toBeNull();
    expect(document.body.textContent).not.toContain('5.Даты:');
  });

  it('shows loading status without rendering the manual HTML act', () => {
    render(
      <DemoAosrPreview
        formVariant={demoAosrFormVariant1}
        printState={createPrintState([])}
        testOnlyPreviewStatus="loading"
      />,
    );

    expect(screen.getByRole('status').textContent).toContain(
      'Готовим предпросмотр из DOCX-шаблона',
    );
    expect(screen.queryByLabelText('Тестовый HTML fallback АОСР')).toBeNull();
    expect(document.querySelector('.act-page')).toBeNull();
  });

  it('shows a DOCX preview error without rendering a fake HTML preview', () => {
    render(
      <DemoAosrPreview
        formVariant={demoAosrFormVariant1}
        printState={createPrintState([])}
        testOnlyPreviewStatus="error"
      />,
    );

    expect(screen.getByRole('alert').textContent).toBe(
      'Не удалось показать предпросмотр DOCX. Скачайте DOCX и проверьте файл.',
    );
    expect(screen.getByLabelText('Предпросмотр DOCX-шаблона АОСР')).toBeTruthy();
    expect(screen.queryByLabelText('Тестовый HTML fallback АОСР')).toBeNull();
    expect(document.querySelector('.act-page')).toBeNull();
  });

  it('renders a single member exactly once under its group title in explicit test-only fallback', () => {
    const groupTitle = 'Представитель подрядчика';
    const introDisplayText =
      'Производитель работ ООО "ПТО Монтаж", Иванов И.И., Приказ № 12-П от 10.05.2026';

    renderFallback(
      <DemoAosrPreview
        formVariant={demoAosrFormVariant1}
        printState={createPrintState([
          {
            members: [
              {
                introDisplayText,
                signatureName: 'Иванов И.И.',
                signatureText: 'Производитель работ ООО "ПТО Монтаж"',
                subscript: '',
              },
            ],
            title: groupTitle,
          },
        ])}
      />,
    );

    const bodyRepresentatives = screen.getByRole('region', { name: 'Представители' });
    expect(within(bodyRepresentatives).getAllByText(`${groupTitle}:`)).toHaveLength(1);
    expect(within(bodyRepresentatives).getAllByText(introDisplayText)).toHaveLength(1);
  });

  it('renders one representative group with multiple members in body and signatures', () => {
    const groupTitle = 'Представитель лица, осуществляющего строительство';
    const firstMember = 'Главный инженер ООО "Монтаж" Иванов И.И.';
    const secondMember = 'Инженер ПТО ООО "Монтаж" Петров П.П.';
    const printState = createPrintState([
      {
        members: [
          {
            introDisplayText: firstMember,
            signatureName: 'Иванов И.И.',
            signatureText: 'Главный инженер ООО "Монтаж"',
            subscript: 'Подстрочный текст первого представителя',
          },
          {
            introDisplayText: secondMember,
            signatureName: 'Петров П.П.',
            signatureText: 'Инженер ПТО ООО "Монтаж"',
            subscript: 'Подстрочный текст второго представителя',
          },
        ],
        title: groupTitle,
      },
    ]);

    renderFallback(<DemoAosrPreview formVariant={demoAosrFormVariant1} printState={printState} />);

    const bodyRepresentatives = screen.getByRole('region', { name: 'Представители' });
    expect(within(bodyRepresentatives).getAllByText(`${groupTitle}:`)).toHaveLength(1);
    expect(within(bodyRepresentatives).getAllByText(firstMember)).toHaveLength(1);
    expect(
      within(bodyRepresentatives).getByText('(Подстрочный текст первого представителя)'),
    ).toBeTruthy();
    expect(within(bodyRepresentatives).getAllByText(secondMember)).toHaveLength(1);
    expect(
      within(bodyRepresentatives).getByText('(Подстрочный текст второго представителя)'),
    ).toBeTruthy();

    const signatures = screen.getByRole('region', { name: 'Подписи представителей' });
    expect(within(signatures).getAllByText(`${groupTitle}:`)).toHaveLength(1);
    expect(within(signatures).getByText('Главный инженер ООО "Монтаж"')).toBeTruthy();
    expect(within(signatures).getByText('Иванов И.И.')).toBeTruthy();
    expect(within(signatures).getByText('Инженер ПТО ООО "Монтаж"')).toBeTruthy();
    expect(within(signatures).getByText('Петров П.П.')).toBeTruthy();
  });

  it('renders final signature as one line with left role and right name plus centered caption row', () => {
    renderFallback(
      <DemoAosrPreview
        formVariant={demoAosrFormVariant1}
        printState={createPrintState([
          {
            members: [
              {
                introDisplayText: 'Производитель работ ООО "ПТО Монтаж", Иванов И.И.',
                signatureName: 'Иванов И.И.',
                signatureText: 'Производитель работ ООО "ПТО Монтаж"',
                subscript: '',
              },
            ],
            title: 'Представитель подрядчика',
          },
        ])}
      />,
    );

    const signatures = screen.getByRole('region', { name: 'Подписи представителей' });
    const signatureLine = signatures.querySelector('.act-page__signature-line-row');
    const signatureCaption = signatures.querySelector('.act-page__signature-caption');

    expect(signatureLine).not.toBeNull();
    expect(signatureLine?.querySelector('.act-page__signature-person')?.textContent).toBe(
      'Производитель работ ООО "ПТО Монтаж"',
    );
    expect(signatureLine?.querySelector('.act-page__signature-name')?.textContent).toBe(
      'Иванов\u00a0И.И.',
    );
    expect(signatureCaption?.textContent).toBe('(должность, фамилия, инициалы, подпись)');
  });

  it('keeps final signature fallback structure close to the DOCX template', () => {
    renderFallback(
      <DemoAosrPreview
        formVariant={demoAosrFormVariant1}
        printState={createPrintState([
          {
            members: [
              {
                introDisplayText: 'Производитель работ ООО "ПТО Монтаж", Иванов И.И.',
                signatureName: 'Иванов И.И.',
                signatureText: 'Производитель работ ООО "ПТО Монтаж"',
                subscript: '',
              },
            ],
            title: 'Представитель подрядчика',
          },
        ])}
      />,
    );

    const signatures = screen.getByRole('region', { name: 'Подписи представителей' });
    const signatureBlock = signatures.querySelector('.act-page__signature-block');
    const signatureLine = signatureBlock?.querySelector('.act-page__signature-line-row');

    expect(signatureBlock?.querySelector('.act-page__block-label')?.textContent).toBe(
      'Представитель подрядчика:',
    );
    expect(signatureLine?.querySelector('.act-page__signature-person')?.textContent).toBe(
      'Производитель работ ООО "ПТО Монтаж"',
    );
    expect(signatureLine?.querySelector('.act-page__signature-name')?.textContent).toBe(
      'Иванов\u00a0И.И.',
    );
    expect(signatureBlock?.querySelectorAll('.act-page__signature-caption')).toHaveLength(1);
  });

  it('does not show DOCX tags or technical placeholders in the explicit test-only fallback', () => {
    renderFallback(
      <DemoAosrPreview formVariant={demoAosrFormVariant1} printState={createEmptyPrintState()} />,
    );

    const fallbackPreview = screen.getByLabelText('Тестовый HTML fallback АОСР');
    const previewText = fallbackPreview.textContent;

    expect(previewText).not.toContain('<<');
    expect(previewText).not.toContain('>>');
    expect(previewText).not.toContain('undefined');
    expect(previewText).not.toContain('null');
    expect(previewText).not.toContain('Материалы не указаны');
    expect(previewText).not.toContain('Документы не указаны');
    expect(previewText).not.toContain('Приложения не указаны');
    expect(fallbackPreview.querySelector('.act-page__print-value')).toBeTruthy();
  });

  it('does not render introDisplayText again when it is duplicated in subscript', () => {
    const duplicateText =
      'Ведущий инженер ООО "СтройКонтроль", Петров П.П., Договор № СК-7, НРС С-66-212868';

    renderFallback(
      <DemoAosrPreview
        formVariant={demoAosrFormVariant1}
        printState={createPrintState([
          {
            members: [
              {
                introDisplayText: duplicateText,
                signatureName: 'Петров П.П.',
                signatureText: 'Ведущий инженер ООО "СтройКонтроль"',
                subscript: `  ${duplicateText}  `,
              },
            ],
            title: 'Стройконтроль',
          },
        ])}
      />,
    );

    const bodyRepresentatives = screen.getByRole('region', { name: 'Представители' });
    expect(within(bodyRepresentatives).getAllByText(duplicateText)).toHaveLength(1);
  });
});

function renderFallback(
  component: ReactElement<{
    readonly previewMode?: 'auto' | 'html-fallback-for-tests-only';
  }>,
): ReturnType<typeof render> {
  return render(cloneElement(component, { previewMode: 'html-fallback-for-tests-only' }));
}

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
      description: 'Тестовые скрытые работы',
      endDateLine: '2026-06-16',
      nextWorks: 'Следующие работы',
      startDateLine: '2026-06-15',
    },
  };
}

function createEmptyPrintState(): AosrPrintState {
  return {
    applications: { items: [] },
    confirmationDocuments: { items: [] },
    counterparties: [],
    document: {
      additionalInfo: '',
      copiesLine: '',
      date: '',
      number: '',
    },
    materials: { items: [] },
    object: {
      name: '',
      nameSubscript: '',
    },
    project: {
      compliance: '',
      documentation: '',
    },
    representatives: {
      groups: [
        {
          members: [
            {
              introDisplayText: '',
              signatureName: '',
              signatureText: '',
              subscript: '',
            },
          ],
          title: 'Представитель подрядчика',
        },
      ],
    },
    work: {
      contractorName: '',
      description: '',
      endDateLine: '',
      nextWorks: '',
      startDateLine: '',
    },
  };
}
