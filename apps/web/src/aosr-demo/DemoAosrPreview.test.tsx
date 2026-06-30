// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { demoAosrFormVariant1 } from '../act-types/act-types.js';
import { DemoAosrPreview } from './DemoAosrPreview.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrPreview', () => {
  it('renders a single member exactly once under its group title', () => {
    const groupTitle = 'Представитель подрядчика';
    const introDisplayText =
      'Производитель работ ООО "ПТО Монтаж", Иванов И.И., Приказ № 12-П от 10.05.2026';

    render(
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

    render(<DemoAosrPreview formVariant={demoAosrFormVariant1} printState={printState} />);

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

  it('does not render introDisplayText again when it is duplicated in subscript', () => {
    const duplicateText =
      'Ведущий инженер ООО "СтройКонтроль", Петров П.П., Договор № СК-7, НРС С-66-212868';

    render(
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
