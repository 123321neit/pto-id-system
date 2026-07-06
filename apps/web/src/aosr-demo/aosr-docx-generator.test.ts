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
const materialsCaption =
  '(наименование строительных материалов (изделий), реквизиты сертификатов и (или) других документов, подтверждающих их качество и безопасность, в случае если необходимо указывать более 5 документов, указывается ссылка на их реестр, который является неотъемлемой частью акта)';
const confirmationDocumentsCaption =
  '(исполнительные схемы и чертежи, результаты экспертиз, обследований, лабораторных и иных испытаний выполненных работ, проведенных в процессе строительного контроля)';
const applicationsCaption =
  '(исполнительные схемы и чертежи, результаты экспертиз, обследований, лабораторных и иных испытаний)';

describe('renderAosrDocxTemplateBytes', () => {
  it('renders the real static AOSR DOCX template without leaving template tags', () => {
    const templateBytes = new Uint8Array(readFileSync(realAosrTemplateUrl));
    const renderedBytes = renderAosrDocxTemplateBytes({
      printState: createPrintState(),
      templateBytes,
    });
    const {
      documentParagraphs,
      documentXml,
      documentXmlParagraphs,
      documentXmlTables,
      renderedEntries,
    } = readRenderedDocumentXml(renderedBytes);

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
    expectSingleCaptionAfterList(documentParagraphs, {
      caption: materialsCaption,
      endFragment: '4.Предъявлены документы',
      itemFragments: ['Воздуховоды оцинкованные 0,7 мм', 'Крепежные элементы КМ-12'],
      startFragment: '3.При выполнении работ применены',
    });
    expectSingleCaptionAfterList(documentParagraphs, {
      caption: confirmationDocumentsCaption,
      endFragment: 'Даты:',
      itemFragments: ['Исполнительная схема ИС-1', 'Журнал работ ЖР-1'],
      startFragment: '4.Предъявлены документы',
    });
    expectSingleCaptionAfterList(documentParagraphs, {
      caption: applicationsCaption,
      endFragment: 'Представитель подрядчика:',
      itemFragments: ['Приложение 1 — фотофиксация работ', 'Приложение 2 — исполнительная схема'],
      startFragment: 'Приложения:',
    });
    expect(countParagraphsEqualTo(documentParagraphs, applicationsCaption)).toBe(1);
    expect(
      getRequiredParagraphXml(documentXmlParagraphs, 'Приложения:').includes('<w:keepNext/>'),
    ).toBe(true);
    expect(
      getLastRequiredTableXml(documentXmlTables, 'Представитель подрядчика:').includes(
        '<w:gridSpan w:val="2"/>',
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
    const { documentParagraphs, documentXml, documentXmlTables } =
      readRenderedDocumentXml(renderedBytes);
    const datesTable = getRequiredTableXml(documentXmlTables, 'Даты:');
    const contractorSignatureTable = getLastRequiredTableXml(
      documentXmlTables,
      'Представитель подрядчика:',
    );

    expect(documentXml).not.toContain('&lt;&lt;');
    expect(documentXml).not.toContain('&gt;&gt;');
    expect(documentXml).not.toContain('<<');
    expect(documentXml).not.toContain('>>');
    expect(documentXml).toContain('№ ОВ-1');
    expect(documentXml).toContain('«01» сентября 2026 г.');
    expect(documentXml).toContain('«03» сентября 2026 г.');
    expect(datesTable).toContain('«01» сентября 2026 г.');
    expect(datesTable).toContain('«03» сентября 2026 г.');
    expect(datesTable).toContain('<w:tblLayout w:type="fixed"/>');
    expect(datesTable).not.toContain('<w:tab/>');
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
    expect(contractorSignatureTable).toContain('Производитель работ ООО');
    expect(contractorSignatureTable).toContain('Иванов\u00a0И.И.');
    expect(contractorSignatureTable).toContain('<w:gridSpan w:val="2"/>');
    expect(contractorSignatureTable).toContain('<w:tcW w:w="6500" w:type="dxa"/>');
    expect(contractorSignatureTable).toContain('<w:tcW w:w="2300" w:type="dxa"/>');
    expect(contractorSignatureTable).not.toContain('<w:tab/>');
    expect(documentParagraphs).toContain('Подрядчик:');
    expect(documentParagraphs).toContain('Технический заказчик:');
    expect(documentParagraphs.some((paragraph) => paragraph.includes(')Подрядчик:'))).toBe(false);
    expect(
      documentParagraphs.some((paragraph) => paragraph.includes(')Технический заказчик:')),
    ).toBe(false);
    expect(documentXml).not.toContain('<w:rPr><w:rPr>');
  });
});

function readRenderedDocumentXml(renderedBytes: Uint8Array): {
  readonly documentParagraphs: readonly string[];
  readonly documentXml: string;
  readonly documentXmlParagraphs: readonly string[];
  readonly documentXmlTables: readonly string[];
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
    documentXmlTables: getWordTableXmlFragments(documentXml),
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

function getRequiredTableXml(tables: readonly string[], textFragment: string): string {
  const table = tables.find((currentTable) =>
    getWordTableText(currentTable).includes(textFragment),
  );

  if (table === undefined) {
    throw new Error(`Rendered DOCX table is missing: ${textFragment}`);
  }

  return table;
}

function getLastRequiredTableXml(tables: readonly string[], textFragment: string): string {
  const table = [...tables]
    .reverse()
    .find((currentTable) => getWordTableText(currentTable).includes(textFragment));

  if (table === undefined) {
    throw new Error(`Rendered DOCX table is missing: ${textFragment}`);
  }

  return table;
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

function getWordTableXmlFragments(documentXml: string): readonly string[] {
  return documentXml.match(/<w:tbl\b[\s\S]*?<\/w:tbl>/gu) ?? [];
}

function getWordTableText(tableXml: string): string {
  return tableXml.replace(/<[^>]+>/gu, '').trim();
}

function expectSingleCaptionAfterList(
  paragraphs: readonly string[],
  {
    caption,
    endFragment,
    itemFragments,
    startFragment,
  }: {
    readonly caption: string;
    readonly endFragment: string;
    readonly itemFragments: readonly string[];
    readonly startFragment: string;
  },
): void {
  const scopedParagraphs = getParagraphRange(paragraphs, startFragment, endFragment);
  const captionIndexes = getParagraphIndexesEqualTo(scopedParagraphs, caption);
  const itemIndexes = itemFragments.map((itemFragment) =>
    getRequiredParagraphIndex(scopedParagraphs, itemFragment),
  );

  expect(captionIndexes).toHaveLength(1);
  expect(getRequiredArrayItem(captionIndexes, 0)).toBeGreaterThan(Math.max(...itemIndexes));
}

function getParagraphRange(
  paragraphs: readonly string[],
  startFragment: string,
  endFragment: string,
): readonly string[] {
  const startIndex = getRequiredParagraphIndex(paragraphs, startFragment);
  const endIndex = getRequiredParagraphIndexAfter(paragraphs, endFragment, startIndex);

  expect(endIndex).toBeGreaterThan(startIndex);

  return paragraphs.slice(startIndex, endIndex);
}

function getRequiredParagraphIndex(paragraphs: readonly string[], textFragment: string): number {
  const paragraphIndex = paragraphs.findIndex((paragraph) => paragraph.includes(textFragment));

  if (paragraphIndex < 0) {
    throw new Error(`Rendered DOCX paragraph is missing: ${textFragment}`);
  }

  return paragraphIndex;
}

function getRequiredParagraphIndexAfter(
  paragraphs: readonly string[],
  textFragment: string,
  startIndex: number,
): number {
  const paragraphIndex = paragraphs.findIndex(
    (paragraph, paragraphIndexCandidate) =>
      paragraphIndexCandidate > startIndex && paragraph.includes(textFragment),
  );

  if (paragraphIndex < 0) {
    throw new Error(`Rendered DOCX paragraph is missing after range start: ${textFragment}`);
  }

  return paragraphIndex;
}

function countParagraphsEqualTo(paragraphs: readonly string[], text: string): number {
  return getParagraphIndexesEqualTo(paragraphs, text).length;
}

function getParagraphIndexesEqualTo(
  paragraphs: readonly string[],
  text: string,
): readonly number[] {
  return paragraphs.flatMap((paragraph, paragraphIndex) =>
    normalizeParagraphText(paragraph) === text ? [paragraphIndex] : [],
  );
}

function normalizeParagraphText(text: string): string {
  return text.trim().replace(/\s+/gu, ' ');
}

function getRequiredArrayItem<TItem>(items: readonly TItem[], index: number): TItem {
  const item = items[index];

  if (item === undefined) {
    throw new Error(`Expected array item at index ${String(index)}.`);
  }

  return item;
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
