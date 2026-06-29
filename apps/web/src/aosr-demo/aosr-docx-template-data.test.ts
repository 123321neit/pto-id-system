import { describe, expect, it } from 'vitest';

import { buildAosrDocxFileName, buildAosrDocxTemplateData } from './aosr-docx-template-data.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

describe('buildAosrDocxTemplateData', () => {
  it('keeps raw document fields and adds DOCX number/date lines', () => {
    const templateData = buildAosrDocxTemplateData(createPrintState());

    expect(templateData.document.number).toBe('ОВ-1');
    expect(templateData.document.numberLine).toBe('№ ОВ-1');
    expect(templateData.document.date).toBe('2026-09-03');
    expect(templateData.document.dateLine).toBe('"03" сентября 2026 г.');
    expect(templateData.object.name).toBe('Поликлиника, корпус А');
    expect(templateData.materials.items[0]?.displayText).toBe('Воздуховоды оцинкованные');
  });

  it('does not block empty numbers and leaves numberLine empty for the template', () => {
    const templateData = buildAosrDocxTemplateData(
      createPrintState({
        document: {
          additionalInfo: 'Пустой номер допускается.',
          copiesLine: 'в 2 экземплярах',
          date: '2026-09-04',
          number: '   ',
        },
      }),
    );

    expect(templateData.document.number).toBe('   ');
    expect(templateData.document.numberLine).toBe('');
    expect(templateData.document.dateLine).toBe('"04" сентября 2026 г.');
  });
});

describe('buildAosrDocxFileName', () => {
  it('uses the requested fallback file name when the act number is empty', () => {
    expect(
      buildAosrDocxFileName(
        createPrintState({
          document: {
            additionalInfo: '',
            copiesLine: '',
            date: '2026-09-03',
            number: '',
          },
        }),
      ),
    ).toBe('АОСР_без_номера.docx');
  });

  it('includes sanitized number and date when the act number exists', () => {
    expect(buildAosrDocxFileName(createPrintState())).toBe('АОСР_ОВ-1_2026-09-03.docx');
  });
});

function createPrintState(overrides: Partial<AosrPrintState> = {}): AosrPrintState {
  return {
    applications: {
      items: [{ displayText: 'Приложение 1' }],
    },
    confirmationDocuments: {
      items: [{ displayText: 'Исполнительная схема ИС-1' }],
    },
    counterparties: [
      {
        displayText: 'ООО "Ромашка"',
        subscript: 'застройщик',
        title: 'Застройщик',
      },
    ],
    document: {
      additionalInfo: 'Дополнительные сведения отсутствуют.',
      copiesLine: 'в 2 экземплярах',
      date: '2026-09-03',
      number: 'ОВ-1',
    },
    materials: {
      items: [{ displayText: 'Воздуховоды оцинкованные' }],
    },
    object: {
      name: 'Поликлиника, корпус А',
      nameSubscript: 'объект капитального строительства',
    },
    project: {
      compliance: 'Работы соответствуют проектной документации.',
      documentation: 'Проектная документация ПД-1',
    },
    representatives: {
      groups: [
        {
          members: [
            {
              introDisplayText: 'Иванов И.И., производитель работ',
              signatureName: 'Иванов И.И.',
              signatureText: 'Производитель работ',
              subscript: 'приказ № 1',
            },
          ],
          title: 'Представитель подрядчика',
        },
      ],
    },
    work: {
      contractorName: 'ООО "ПТО Монтаж"',
      description: 'Монтаж воздуховодов',
      endDateLine: '2026-09-03',
      nextWorks: 'Изоляция воздуховодов',
      startDateLine: '2026-09-01',
    },
    ...overrides,
  };
}
