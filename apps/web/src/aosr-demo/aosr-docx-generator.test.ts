import { readFileSync } from 'node:fs';

import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';

import { renderAosrDocxTemplateBytes } from './aosr-docx-generator.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

const realAosrTemplateUrl = new URL(
  '../../public/templates/aosr/AOSR1_template_final_tags_corrected.docx',
  import.meta.url,
);

describe('renderAosrDocxTemplateBytes', () => {
  it('renders the real static AOSR DOCX template without leaving template tags', () => {
    const templateBytes = new Uint8Array(readFileSync(realAosrTemplateUrl));
    const renderedBytes = renderAosrDocxTemplateBytes({
      printState: createPrintState(),
      templateBytes,
    });
    const renderedEntries = unzipSync(renderedBytes);
    const documentXmlBytes = renderedEntries['word/document.xml'];

    expect(renderedEntries['[Content_Types].xml']).toBeDefined();
    expect(documentXmlBytes).toBeDefined();

    if (documentXmlBytes === undefined) {
      throw new Error('Rendered DOCX does not contain word/document.xml.');
    }

    const documentXml = strFromU8(documentXmlBytes);

    expect(documentXml).not.toContain('&lt;&lt;');
    expect(documentXml).not.toContain('&gt;&gt;');
    expect(documentXml).not.toContain('<<');
    expect(documentXml).not.toContain('>>');
    expect(documentXml).toContain('ОВ-1');
    expect(documentXml).toContain('Поликлиника корпус А');
    expect(documentXml).toContain('ПТО Монтаж');
    expect(documentXml).toContain('Воздуховоды оцинкованные');
    expect(documentXml).toContain('Иванов И.И.');
    expect(documentXml).toContain('&quot;01&quot; сентября 2026 г.');
    expect(documentXml).toContain('приказ № 1');
    expect(documentXml).toContain('застройщик');
  });
});

function createPrintState(): AosrPrintState {
  return {
    applications: {
      items: [{ displayText: 'Приложение 1 — фотофиксация работ' }],
    },
    confirmationDocuments: {
      items: [{ displayText: 'Исполнительная схема ИС-1' }],
    },
    counterparties: [
      {
        displayText: 'ООО Ромашка',
        subscript: 'застройщик',
        title: 'Застройщик',
      },
    ],
    document: {
      additionalInfo: 'Дополнительные сведения отсутствуют.',
      copiesLine: '2',
      date: '2026-09-03',
      number: 'ОВ-1',
    },
    materials: {
      items: [{ displayText: 'Воздуховоды оцинкованные 0,7 мм' }],
    },
    object: {
      name: 'Поликлиника корпус А',
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
      contractorName: 'ПТО Монтаж',
      description: 'Монтаж воздуховодов',
      endDateLine: '2026-09-03',
      nextWorks: 'Изоляция воздуховодов',
      startDateLine: '2026-09-01',
    },
  };
}
