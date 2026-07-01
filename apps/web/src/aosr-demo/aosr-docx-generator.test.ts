import { readFileSync } from 'node:fs';

import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';

import { renderAosrDocxTemplateBytes } from './aosr-docx-generator.js';
import {
  buildDemoAosrPrintState,
  demoAosrWorkspace,
  getDraftMaterialCertificates,
  getDraftObjectDocuments,
  getIncludedDraftApplications,
  type AosrPrintState,
} from './demo-aosr-workspace.js';

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
    const { documentParagraphs, documentXml, documentXmlParagraphs, renderedEntries } =
      readRenderedDocumentXml(renderedBytes);

    expect(renderedEntries['[Content_Types].xml']).toBeDefined();

    expect(documentXml).not.toContain('&lt;&lt;');
    expect(documentXml).not.toContain('&gt;&gt;');
    expect(documentXml).not.toContain('<<');
    expect(documentXml).not.toContain('>>');
    expect(documentXml).toContain('ОВ-1');
    expect(documentXml).toContain('Поликлиника корпус А');
    expect(documentXml).toContain('ПТО Монтаж');
    expect(documentXml).toContain('Воздуховоды оцинкованные');
    expect(documentXml).toContain('Иванов И.И.');
    expect(documentXml).toContain('Иванов\u00a0И.И.');
    expect(documentXml).toContain('«01» сентября 2026 г.');
    expect(documentXml).toContain('приказ № 1');
    expect(documentXml).toContain('застройщик');
    expect(
      countParagraphsWithText(documentParagraphs, 'наименование строительных материалов'),
    ).toBe(1);
    expect(
      countParagraphsWithText(documentParagraphs, 'проведенных в процессе строительного контроля'),
    ).toBe(1);
    expect(
      countParagraphsWithText(
        documentParagraphs,
        'исполнительные схемы и чертежи, результаты экспертиз, обследований, лабораторных и иных испытаний',
      ),
    ).toBe(2);
    expect(
      getRequiredParagraphXml(documentXmlParagraphs, 'Приложения:').includes('<w:keepNext/>'),
    ).toBe(true);
    expect(
      getLastRequiredParagraphXml(documentXmlParagraphs, 'Представитель подрядчика:').includes(
        '<w:keepNext/>',
      ),
    ).toBe(true);
  });

  it('renders the current demo AOSR without known formatting regressions', () => {
    const templateBytes = new Uint8Array(readFileSync(realAosrTemplateUrl));
    const draft = getRequiredDemoDraft();
    const printState = buildDemoAosrPrintState({
      draft,
      finalApplications: getIncludedDraftApplications(
        draft,
        [],
        demoAosrWorkspace.objectDocumentLibrary,
      ),
      objectDefaults: demoAosrWorkspace.objectDefaults,
      selectedMaterials: getDraftMaterialCertificates(draft, []),
      selectedObjectDocuments: getDraftObjectDocuments(
        draft,
        demoAosrWorkspace.objectDocumentLibrary,
      ),
    });
    const renderedBytes = renderAosrDocxTemplateBytes({ printState, templateBytes });
    const { documentParagraphs, documentXml, documentXmlParagraphs } =
      readRenderedDocumentXml(renderedBytes);
    const contractorSignatureParagraph = getRequiredParagraphXml(
      documentXmlParagraphs,
      'Производитель работ ООО',
      '<w:pBdr>',
    );
    const contractorSignatureTextIndex =
      contractorSignatureParagraph.indexOf('Производитель работ ООО');
    const contractorSignatureFirstTabIndex = contractorSignatureParagraph.indexOf('<w:tab/>');

    expect(documentXml).not.toContain('&lt;&lt;');
    expect(documentXml).not.toContain('&gt;&gt;');
    expect(documentXml).not.toContain('<<');
    expect(documentXml).not.toContain('>>');
    expect(documentXml).toContain('№ ОВ-1');
    expect(documentXml).toContain('«01» сентября 2026 г.');
    expect(documentXml).toContain('«03» сентября 2026 г.');
    expect(documentXml).not.toContain('2026-09-01');
    expect(documentXml).not.toContain('2026-09-03');
    expect(documentXml).not.toContain('Разрешается производство последующих работ по: Разрешается');
    expect(documentXml).not.toContain('облицовкой.;');
    expect(documentXml).not.toContain('N 12-П');
    expect(documentXml).not.toContain('N СК-7');
    expect(documentXml).not.toContain('N СТ-ОВ');
    expect(documentXml).not.toContain('N ПС-КМ');
    expect(documentXml).toContain(
      'Воздуховоды оцинкованные 0,7 мм (Сертификат соответствия № СТ-ОВ-2026-017 от 12.05.2026)',
    );
    expect(documentXml).not.toContain('СТ-ОВ-2026-017 от 12.05.2026, СТ-ОВ-2026-017');
    expect(documentXml).toContain('Крепежные элементы КМ-12 (Паспорт качества № ПС-КМ-48');
    expect(documentXml).not.toContain('ПС-КМ-48 от 18.05.2026, ПС-КМ-48');
    expect(documentXml).toContain('Исполнительная схема скрытых участков вентиляции ИС-ОВ-04');
    expect(documentXml).toContain('Запись журнала входного контроля материалов ЖВК-2026-05');
    expect(documentXml).not.toContain(
      'Исполнительная схема скрытых участков вентиляции Исполнительная схема / ИС-ОВ-04',
    );
    expect(documentXml).not.toContain(
      'Запись журнала входного контроля материалов Журнал / ЖВК-2026-05',
    );
    expect(documentParagraphs).toContain('Подрядчик:');
    expect(documentParagraphs).toContain('Технический заказчик:');
    expect(documentParagraphs.some((paragraph) => paragraph.includes(')Подрядчик:'))).toBe(false);
    expect(
      documentParagraphs.some((paragraph) => paragraph.includes(')Технический заказчик:')),
    ).toBe(false);
    expect(contractorSignatureFirstTabIndex).toBeGreaterThan(contractorSignatureTextIndex);
    expect(documentXml).toContain('<w:keepNext/><w:keepLines/><w:pBdr>');
  });
});

function readRenderedDocumentXml(renderedBytes: Uint8Array): {
  readonly documentParagraphs: readonly string[];
  readonly documentXml: string;
  readonly documentXmlParagraphs: readonly string[];
  readonly renderedEntries: Record<string, Uint8Array>;
} {
  const renderedEntries = unzipSync(renderedBytes);
  const documentXmlBytes = renderedEntries['word/document.xml'];

  expect(documentXmlBytes).toBeDefined();

  if (documentXmlBytes === undefined) {
    throw new Error('Rendered DOCX does not contain word/document.xml.');
  }

  const documentXml = strFromU8(documentXmlBytes);

  return {
    documentParagraphs: getWordParagraphTexts(documentXml),
    documentXml,
    documentXmlParagraphs: getWordParagraphXmlFragments(documentXml),
    renderedEntries,
  };
}

function getRequiredParagraphXml(
  paragraphs: readonly string[],
  textFragment: string,
  requiredXmlFragment = '',
): string {
  const paragraph = paragraphs.find(
    (currentParagraph) =>
      getWordParagraphText(currentParagraph).includes(textFragment) &&
      (requiredXmlFragment === '' || currentParagraph.includes(requiredXmlFragment)),
  );

  if (paragraph === undefined) {
    throw new Error(`Rendered DOCX paragraph is missing: ${textFragment}`);
  }

  return paragraph;
}

function countParagraphsWithText(paragraphs: readonly string[], textFragment: string): number {
  return paragraphs.filter((paragraph) => paragraph.includes(textFragment)).length;
}

function getLastRequiredParagraphXml(paragraphs: readonly string[], textFragment: string): string {
  const paragraph = [...paragraphs]
    .reverse()
    .find((currentParagraph) => getWordParagraphText(currentParagraph).includes(textFragment));

  if (paragraph === undefined) {
    throw new Error(`Rendered DOCX paragraph is missing: ${textFragment}`);
  }

  return paragraph;
}

function getWordParagraphTexts(documentXml: string): readonly string[] {
  return getWordParagraphXmlFragments(documentXml).map(getWordParagraphText).filter(Boolean);
}

function getWordParagraphXmlFragments(documentXml: string): readonly string[] {
  return documentXml.match(/<w:p\b[\s\S]*?<\/w:p>/gu) ?? [];
}

function getWordParagraphText(paragraphXml: string): string {
  return paragraphXml.replace(/<[^>]+>/gu, '').trim();
}

function getRequiredDemoDraft() {
  const draft = demoAosrWorkspace.drafts[0];

  if (draft === undefined) {
    throw new Error('Expected the demo workspace to include the first AOSR draft.');
  }

  return draft;
}

function createPrintState(): AosrPrintState {
  return {
    applications: {
      items: [
        { displayText: 'Приложение 1 — фотофиксация работ' },
        { displayText: 'Приложение 2 — исполнительная схема' },
      ],
    },
    confirmationDocuments: {
      items: [{ displayText: 'Исполнительная схема ИС-1' }, { displayText: 'Журнал работ ЖР-1' }],
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
      items: [
        { displayText: 'Воздуховоды оцинкованные 0,7 мм' },
        { displayText: 'Крепежные элементы КМ-12' },
      ],
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
