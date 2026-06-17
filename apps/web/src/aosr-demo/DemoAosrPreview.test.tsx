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
  it('renders one representative group with multiple members in body and signatures', () => {
    const groupTitle = 'Представитель лица, осуществляющего строительство';
    const printState: AosrPrintState = {
      applications: { items: [] },
      confirmationDocuments: { items: [] },
      counterparties: [],
      document: {
        additionalInfo: '',
        copiesLine: '2',
        date: '2026-06-17',
        number: 'ОВ-77',
        underTitleText: '',
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
      representatives: {
        groups: [
          {
            members: [
              {
                introDisplayText: 'Главный инженер ООО "Монтаж" Иванов И.И.',
                signatureName: 'Иванов И.И.',
                signatureText: 'Главный инженер ООО "Монтаж"',
                subscript: 'Подстрочный текст первого представителя',
              },
              {
                introDisplayText: 'Инженер ПТО ООО "Монтаж" Петров П.П.',
                signatureName: 'Петров П.П.',
                signatureText: 'Инженер ПТО ООО "Монтаж"',
                subscript: 'Подстрочный текст второго представителя',
              },
            ],
            title: groupTitle,
          },
        ],
      },
      work: {
        contractorName: 'ООО "Монтаж"',
        description: 'Тестовые скрытые работы',
        endDateLine: '2026-06-16',
        nextWorks: 'Следующие работы',
        startDateLine: '2026-06-15',
      },
    };

    render(<DemoAosrPreview formVariant={demoAosrFormVariant1} printState={printState} />);

    const bodyRepresentatives = screen.getByRole('region', { name: 'Представители' });
    expect(within(bodyRepresentatives).getAllByText(`${groupTitle}:`)).toHaveLength(1);
    expect(
      within(bodyRepresentatives).getByText('Главный инженер ООО "Монтаж" Иванов И.И.'),
    ).toBeTruthy();
    expect(
      within(bodyRepresentatives).getByText('Подстрочный текст первого представителя'),
    ).toBeTruthy();
    expect(
      within(bodyRepresentatives).getByText('Инженер ПТО ООО "Монтаж" Петров П.П.'),
    ).toBeTruthy();
    expect(
      within(bodyRepresentatives).getByText('Подстрочный текст второго представителя'),
    ).toBeTruthy();

    const signatures = screen.getByRole('region', { name: 'Подписи представителей' });
    expect(within(signatures).getAllByText(`${groupTitle}:`)).toHaveLength(1);
    expect(within(signatures).getByText('Главный инженер ООО "Монтаж" Иванов И.И.')).toBeTruthy();
    expect(within(signatures).getByText('Инженер ПТО ООО "Монтаж" Петров П.П.')).toBeTruthy();
  });
});
