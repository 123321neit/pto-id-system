import { strToU8, zipSync } from 'fflate';

import type {
  IdRegisterContractorRow,
  IdRegisterDrawingSetRow,
  IdRegisterExecutionDocumentRow,
  IdRegisterJournalRow,
  IdRegisterObjectDocumentRow,
  IdRegisterPrintState,
  IdRegisterQualityDocumentRow,
} from './id-register-print-state.js';

const ID_REGISTER_DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const RELATIONSHIPS_NAMESPACE = 'http://schemas.openxmlformats.org/package/2006/relationships';
const OFFICE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const CORE_PROPERTIES_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/metadata/core-properties';
const DC_NAMESPACE = 'http://purl.org/dc/elements/1.1/';
const DCTERMS_NAMESPACE = 'http://purl.org/dc/terms/';
const DCMI_TYPE_NAMESPACE = 'http://purl.org/dc/dcmitype/';
const XML_SCHEMA_INSTANCE_NAMESPACE = 'http://www.w3.org/2001/XMLSchema-instance';

const TABLE_WIDTH = 15_400;
const FONT_SIZE_9PT = 18;
const FONT_SIZE_10PT = 20;
const FONT_SIZE_11PT = 22;
const FONT_SIZE_12PT = 24;

interface IdRegisterDocxDownloadOptions {
  readonly browserDocument?: Document;
  readonly browserUrl?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>;
}

type WordAlignment = 'center' | 'left' | 'right';

interface WordParagraphOptions {
  readonly alignment?: WordAlignment;
  readonly bold?: boolean;
  readonly fontSize?: number;
  readonly italic?: boolean;
  readonly keepNext?: boolean;
  readonly spacingAfter?: number;
  readonly spacingBefore?: number;
  readonly underline?: boolean;
}

interface WordCellOptions extends WordParagraphOptions {
  readonly verticalAlign?: 'center' | 'top';
}

export function generateIdRegisterDocxBytes(printState: IdRegisterPrintState): Uint8Array {
  return zipSync({
    '[Content_Types].xml': strToU8(buildContentTypesXml()),
    '_rels/.rels': strToU8(buildPackageRelationshipsXml()),
    'docProps/app.xml': strToU8(buildAppPropertiesXml()),
    'docProps/core.xml': strToU8(buildCorePropertiesXml(printState)),
    'word/document.xml': strToU8(buildDocumentXml(printState)),
    'word/settings.xml': strToU8(buildSettingsXml()),
    'word/styles.xml': strToU8(buildStylesXml()),
  });
}

export function generateIdRegisterDocxBlob(printState: IdRegisterPrintState): Blob {
  const docxBytes = generateIdRegisterDocxBytes(printState);

  return new Blob([copyBytesToArrayBuffer(docxBytes)], { type: ID_REGISTER_DOCX_MIME_TYPE });
}

export function downloadIdRegisterDocx(
  printState: IdRegisterPrintState,
  { browserDocument = document, browserUrl = URL }: IdRegisterDocxDownloadOptions = {},
): void {
  const docxBlob = generateIdRegisterDocxBlob(printState);
  const downloadUrl = browserUrl.createObjectURL(docxBlob);
  const downloadLink = browserDocument.createElement('a');

  downloadLink.href = downloadUrl;
  downloadLink.download = buildIdRegisterDocxFileName(printState);
  downloadLink.style.display = 'none';
  browserDocument.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  browserUrl.revokeObjectURL(downloadUrl);
}

export function buildIdRegisterDocxFileName(printState: IdRegisterPrintState): string {
  const sourceName =
    printState.scope.kind === 'folder'
      ? (printState.scope.folderName ?? printState.scope.title)
      : printState.work.name;
  const safeSourceName = sanitizeFileName(sourceName);

  return safeSourceName === '' ? 'Реестр.docx' : `Реестр_${safeSourceName}.docx`;
}

function buildDocumentXml(printState: IdRegisterPrintState): string {
  const bodyParts = [
    wordParagraph('РЕЕСТР', {
      alignment: 'center',
      bold: true,
      fontSize: FONT_SIZE_12PT,
      spacingAfter: 80,
    }),
    wordParagraph('исполнительной документации', {
      alignment: 'center',
      bold: true,
      fontSize: FONT_SIZE_12PT,
      spacingAfter: 160,
    }),
    wordParagraph(printState.object.name, {
      alignment: 'center',
      bold: true,
      fontSize: FONT_SIZE_11PT,
      spacingAfter: 80,
    }),
    wordParagraph(printState.scope.title, {
      alignment: 'center',
      fontSize: FONT_SIZE_10PT,
      spacingAfter: 60,
    }),
    wordParagraph(printState.scope.description, {
      alignment: 'center',
      fontSize: FONT_SIZE_9PT,
      spacingAfter: 180,
    }),
    buildContractorsSection(printState.contractors.rows),
    buildDrawingSetsSection(printState.drawingSets.rows),
    buildQualityDocumentsSection(printState.qualityDocuments.rows),
    buildExecutionDocumentsSection(printState.executionDocuments.rows),
    buildExecutiveSchemesSection(printState.executiveSchemes.rows),
    buildJournalsSection(printState.journals.rows),
    buildSignatureSection(printState),
    buildSectionPropertiesXml(),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${WORD_NAMESPACE}">
  <w:body>
    ${bodyParts.join('\n')}
  </w:body>
</w:document>`;
}

function buildContractorsSection(rows: readonly IdRegisterContractorRow[]): string {
  return [
    sectionHeading('1. Участники строительства'),
    wordTable({
      headers: [
        '№ п/п',
        'Наименование лица, осуществляющего строительство',
        'Виды работ',
        'Представитель',
        'Документ о полномочиях',
        'Контактные данные',
        'Сведения о допусках / лицензиях',
        'Проектная документация',
      ],
      rows: withFallbackRow(
        rows.map((row, index) => [
          String(index + 1),
          row.organizationName,
          row.workTypes,
          row.representative,
          row.authorityDocument,
          row.contactDetails,
          row.licenses,
          row.projectDocumentation,
        ]),
        8,
      ),
      widths: [800, 2_300, 1_900, 2_200, 1_900, 2_200, 1_700, 2_400],
    }),
  ].join('\n');
}

function buildDrawingSetsSection(rows: readonly IdRegisterDrawingSetRow[]): string {
  return [
    sectionHeading('2. Проектная и рабочая документация'),
    wordTable({
      headers: ['№ п/п', 'Обозначение', 'Наименование комплекта', 'Организация / листов'],
      rows: withFallbackRow(
        rows.map((row, index) => [
          String(index + 1),
          row.reference,
          row.projectName,
          [row.organizationName, row.sheetCount].filter(Boolean).join('\n'),
        ]),
        4,
      ),
      widths: [900, 2_600, 8_100, 3_800],
    }),
  ].join('\n');
}

function buildQualityDocumentsSection(rows: readonly IdRegisterQualityDocumentRow[]): string {
  return [
    sectionHeading('3. Документы о качестве применённых материалов'),
    wordTable({
      headers: [
        '№ п/п',
        'Наименование документа',
        'Номер документа',
        'Организация, выдавшая документ / срок действия',
        'Количество',
      ],
      rows: withFallbackRow(
        rows.map((row, index) => [
          String(index + 1),
          row.documentName,
          row.registrationNumber,
          row.issuerAndValidity,
          row.quantity,
        ]),
        5,
      ),
      widths: [900, 5_500, 2_400, 5_400, 1_200],
    }),
  ].join('\n');
}

function buildExecutionDocumentsSection(rows: readonly IdRegisterExecutionDocumentRow[]): string {
  return [
    sectionHeading('4. Акты освидетельствования скрытых работ'),
    wordTable({
      headers: ['№ п/п', 'Номер акта', 'Наименование работ', 'Дата', 'Примечание'],
      rows: withFallbackRow(
        rows.map((row, index) => [
          String(index + 1),
          row.documentNumberDisplay,
          row.documentName,
          row.documentDateDisplay,
          [row.folderName, row.note].filter(Boolean).join('\n'),
        ]),
        5,
      ),
      widths: [900, 2_000, 8_300, 1_800, 2_400],
    }),
  ].join('\n');
}

function buildExecutiveSchemesSection(rows: readonly IdRegisterObjectDocumentRow[]): string {
  return [
    sectionHeading('5. Исполнительные схемы и чертежи'),
    wordTable({
      headers: ['№ п/п', 'Наименование документа', 'Обозначение / номер', 'Дата / примечание'],
      rows: withFallbackRow(
        rows.map((row, index) => [
          String(index + 1),
          row.documentName,
          row.registrationNumber,
          [row.documentDateDisplay, row.note].filter(Boolean).join('\n'),
        ]),
        4,
      ),
      widths: [900, 7_600, 3_400, 3_500],
    }),
  ].join('\n');
}

function buildJournalsSection(rows: readonly IdRegisterJournalRow[]): string {
  return [
    sectionHeading('6. Журналы производства работ'),
    wordTable({
      headers: ['№ п/п', 'Наименование журнала', 'Номер и дата', 'Ответственный', 'Примечание'],
      rows: withFallbackRow(
        rows.map((row, index) => [
          String(index + 1),
          row.documentName,
          row.registrationNumberAndDate,
          row.responsibleParty,
          row.note,
        ]),
        5,
      ),
      widths: [900, 6_600, 3_100, 2_600, 2_200],
    }),
  ].join('\n');
}

function buildSignatureSection(printState: IdRegisterPrintState): string {
  const contractor = printState.contractors.rows[0];

  return [
    wordParagraph('', { spacingAfter: 120 }),
    wordTable({
      headers: [],
      rows: [
        ['Реестр составил', contractor?.representative ?? ''],
        ['Организация', contractor?.organizationName ?? ''],
        ['Подпись', '__________________________'],
      ],
      tableBorders: false,
      widths: [3_700, 11_700],
    }),
  ].join('\n');
}

function sectionHeading(text: string): string {
  return wordParagraph(text, {
    bold: true,
    fontSize: FONT_SIZE_10PT,
    keepNext: true,
    spacingAfter: 60,
    spacingBefore: 160,
  });
}

function wordTable({
  headers,
  rows,
  tableBorders = true,
  widths,
}: {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly tableBorders?: boolean;
  readonly widths: readonly number[];
}): string {
  const headerRow =
    headers.length === 0
      ? ''
      : wordRow(headers, widths, {
          bold: true,
          fontSize: FONT_SIZE_9PT,
          isHeader: true,
          paragraphAlignment: 'center',
        });
  const bodyRows = rows
    .map((row) =>
      wordRow(row, widths, {
        fontSize: FONT_SIZE_9PT,
        paragraphAlignment: 'left',
      }),
    )
    .join('\n');

  return `<w:tbl>
  <w:tblPr>
    <w:tblW w:w="${String(TABLE_WIDTH)}" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    ${tableBorders ? buildTableBordersXml() : '<w:tblBorders/>'}
    <w:tblCellMar>
      <w:top w:w="40" w:type="dxa"/>
      <w:left w:w="60" w:type="dxa"/>
      <w:bottom w:w="40" w:type="dxa"/>
      <w:right w:w="60" w:type="dxa"/>
    </w:tblCellMar>
  </w:tblPr>
  <w:tblGrid>
    ${widths.map((width) => `<w:gridCol w:w="${String(width)}"/>`).join('')}
  </w:tblGrid>
  ${headerRow}
  ${bodyRows}
</w:tbl>`;
}

function wordRow(
  cells: readonly string[],
  widths: readonly number[],
  {
    bold = false,
    fontSize = FONT_SIZE_9PT,
    isHeader = false,
    paragraphAlignment,
  }: {
    readonly bold?: boolean;
    readonly fontSize?: number;
    readonly isHeader?: boolean;
    readonly paragraphAlignment: WordAlignment;
  },
): string {
  const tableHeader = isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : '';

  return `<w:tr>
  ${tableHeader}
  ${widths
    .map((width, index) =>
      wordCell(cells[index] ?? '', width, {
        alignment: index === 0 ? 'center' : paragraphAlignment,
        bold,
        fontSize,
        verticalAlign: isHeader ? 'center' : 'top',
      }),
    )
    .join('\n')}
</w:tr>`;
}

function wordCell(text: string, width: number, options: WordCellOptions): string {
  return `<w:tc>
  <w:tcPr>
    <w:tcW w:w="${String(width)}" w:type="dxa"/>
    <w:vAlign w:val="${options.verticalAlign ?? 'top'}"/>
  </w:tcPr>
  ${wordParagraph(text, { ...options, spacingAfter: 0, spacingBefore: 0 })}
</w:tc>`;
}

function wordParagraph(text: string, options: WordParagraphOptions = {}): string {
  const paragraphProperties = buildParagraphPropertiesXml(options);
  const runProperties = buildRunPropertiesXml(options);
  const textRuns = buildMultilineTextRuns(text);

  return `<w:p>
  ${paragraphProperties}
  <w:r>
    ${runProperties}
    ${textRuns}
  </w:r>
</w:p>`;
}

function buildParagraphPropertiesXml(options: WordParagraphOptions): string {
  const spacingBefore = String(options.spacingBefore ?? 0);
  const spacingAfter = String(options.spacingAfter ?? 0);
  const parts = [
    options.alignment === undefined ? '' : `<w:jc w:val="${options.alignment}"/>`,
    options.keepNext === true ? '<w:keepNext/>' : '',
    `<w:spacing w:before="${spacingBefore}" w:after="${spacingAfter}" w:line="240" w:lineRule="auto"/>`,
  ].filter(Boolean);

  return parts.length === 0 ? '' : `<w:pPr>${parts.join('')}</w:pPr>`;
}

function buildRunPropertiesXml({
  bold = false,
  fontSize = FONT_SIZE_10PT,
  italic = false,
  underline = false,
}: WordParagraphOptions): string {
  const fontSizeValue = String(fontSize);

  return `<w:rPr>
  <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
  ${bold ? '<w:b/><w:bCs/>' : ''}
  ${italic ? '<w:i/><w:iCs/>' : ''}
  ${underline ? '<w:u w:val="single"/>' : ''}
  <w:sz w:val="${fontSizeValue}"/>
  <w:szCs w:val="${fontSizeValue}"/>
</w:rPr>`;
}

function buildMultilineTextRuns(text: string): string {
  const lines = text.split('\n');

  return lines
    .map((line, index) => {
      const lineXml = `<w:t xml:space="preserve">${escapeXml(line)}</w:t>`;

      return index === lines.length - 1 ? lineXml : `${lineXml}<w:br/>`;
    })
    .join('');
}

function withFallbackRow(
  rows: readonly (readonly string[])[],
  columnCount: number,
): readonly (readonly string[])[] {
  if (rows.length > 0) {
    return rows;
  }

  return [[...Array.from({ length: columnCount }, (_, index) => (index === 0 ? '—' : ''))]];
}

function buildTableBordersXml(): string {
  return `<w:tblBorders>
  <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
  <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
  <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
</w:tblBorders>`;
}

function buildSectionPropertiesXml(): string {
  return `<w:sectPr>
  <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
  <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>
  <w:cols w:space="720"/>
  <w:docGrid w:linePitch="360"/>
</w:sectPr>`;
}

function buildContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
}

function buildPackageRelationshipsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${RELATIONSHIPS_NAMESPACE}">
  <Relationship Id="rId1" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="${RELATIONSHIPS_NAMESPACE}/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function buildCorePropertiesXml(printState: IdRegisterPrintState): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="${CORE_PROPERTIES_NAMESPACE}" xmlns:dc="${DC_NAMESPACE}" xmlns:dcterms="${DCTERMS_NAMESPACE}" xmlns:dcmitype="${DCMI_TYPE_NAMESPACE}" xmlns:xsi="${XML_SCHEMA_INSTANCE_NAMESPACE}">
  <dc:title>${escapeXml(printState.scope.title)}</dc:title>
  <dc:subject>Реестр исполнительной документации</dc:subject>
  <dc:creator>ИДея</dc:creator>
  <cp:lastModifiedBy>ИДея</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-07-07T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-07-07T00:00:00Z</dcterms:modified>
</cp:coreProperties>`;
}

function buildAppPropertiesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>ИДея</Application>
</Properties>`;
}

function buildSettingsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="${WORD_NAMESPACE}">
  <w:displayBackgroundShape/>
  <w:compat/>
</w:settings>`;
}

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${WORD_NAMESPACE}">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="${String(FONT_SIZE_10PT)}"/>
        <w:szCs w:val="${String(FONT_SIZE_10PT)}"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="0" w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`;
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/gu, '_')
    .replace(/\s+/gu, '_');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&apos;');
}

function copyBytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(arrayBuffer).set(bytes);

  return arrayBuffer;
}
