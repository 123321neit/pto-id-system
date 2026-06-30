import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

import {
  buildAosrDocxFileName,
  buildAosrDocxTemplateData,
  type AosrDocxTemplateData,
} from './aosr-docx-template-data.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

export const AOSR_DOCX_TEMPLATE_URL = '/templates/aosr/AOSR1_template_final_tags_corrected.docx';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

type TemplateContext = Record<string, unknown>;

interface TemplateBlockBoundary {
  readonly endIndex: number;
  readonly startIndex: number;
}

interface WordParagraphWrappedTemplateBlock {
  readonly blockPrefix: string;
  readonly blockSuffix: string;
  readonly bodyStartIndex: number;
  readonly cursorEndIndex: number;
  readonly staticPrefix: string;
}

interface WordTextNode {
  readonly combinedEnd: number;
  readonly combinedStart: number;
  readonly contentEnd: number;
  readonly contentStart: number;
  readonly text: string;
}

interface TemplateTagRange {
  readonly end: number;
  readonly start: number;
  readonly text: string;
}

interface AosrDocxDownloadOptions {
  readonly browserDocument?: Document;
  readonly browserUrl?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>;
  readonly templateUrl?: string;
}

export interface RenderAosrDocxTemplateBytesInput {
  readonly printState: AosrPrintState;
  readonly templateBytes: Uint8Array;
}

export async function generateAosrDocxBlob(
  printState: AosrPrintState,
  templateUrl = AOSR_DOCX_TEMPLATE_URL,
): Promise<Blob> {
  const templateResponse = await fetch(templateUrl);

  if (!templateResponse.ok) {
    throw new Error(`AOSR DOCX template request failed: ${String(templateResponse.status)}`);
  }

  const templateBuffer = await templateResponse.arrayBuffer();
  const renderedBytes = renderAosrDocxTemplateBytes({
    printState,
    templateBytes: new Uint8Array(templateBuffer),
  });

  return new Blob([copyBytesToArrayBuffer(renderedBytes)], { type: DOCX_MIME_TYPE });
}

export function renderAosrDocxTemplateBytes({
  printState,
  templateBytes,
}: RenderAosrDocxTemplateBytesInput): Uint8Array {
  const templateData = buildAosrDocxTemplateData(printState);
  const templateEntries = unzipSync(templateBytes);
  const renderedEntries: Record<string, Uint8Array> = {};

  for (const [entryName, entryData] of Object.entries(templateEntries)) {
    if (isRenderableWordXmlEntry(entryName)) {
      renderedEntries[entryName] = strToU8(
        renderAosrDocxTemplateXml(strFromU8(entryData), templateData),
      );
      continue;
    }

    renderedEntries[entryName] = entryData;
  }

  return zipSync(renderedEntries);
}

export async function downloadAosrDocx(
  printState: AosrPrintState,
  {
    browserDocument = document,
    browserUrl = URL,
    templateUrl = AOSR_DOCX_TEMPLATE_URL,
  }: AosrDocxDownloadOptions = {},
): Promise<void> {
  const docxBlob = await generateAosrDocxBlob(printState, templateUrl);
  const downloadUrl = browserUrl.createObjectURL(docxBlob);
  const downloadLink = browserDocument.createElement('a');

  downloadLink.href = downloadUrl;
  downloadLink.download = buildAosrDocxFileName(printState);
  downloadLink.style.display = 'none';
  browserDocument.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  browserUrl.revokeObjectURL(downloadUrl);
}

function renderAosrDocxTemplateXml(xml: string, data: AosrDocxTemplateData): string {
  return stabilizeAosrSignatureParagraphs(
    renderTemplateFragment(normalizeSplitWordTemplateTags(xml), data as unknown as TemplateContext),
  );
}

function copyBytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(arrayBuffer).set(bytes);

  return arrayBuffer;
}

function normalizeSplitWordTemplateTags(xml: string): string {
  const textNodes = getWordTextNodes(xml);

  if (textNodes.length === 0) {
    return xml;
  }

  const combinedText = textNodes.map((textNode) => textNode.text).join('');
  const tagRanges = getTemplateTagRanges(combinedText);

  if (tagRanges.length === 0) {
    return xml;
  }

  const normalizedTextNodes = getNormalizedWordTextNodes(combinedText, textNodes, tagRanges);

  return replaceWordTextNodeContents(xml, textNodes, normalizedTextNodes);
}

function getTemplateTagRanges(combinedText: string): readonly TemplateTagRange[] {
  const tagPattern = createTemplateTagPattern();
  const tagRanges: TemplateTagRange[] = [];
  let tagMatch = tagPattern.exec(combinedText);

  while (tagMatch !== null) {
    tagRanges.push({
      end: tagMatch.index + tagMatch[0].length,
      start: tagMatch.index,
      text: tagMatch[0],
    });

    tagMatch = tagPattern.exec(combinedText);
  }

  return tagRanges;
}

function getNormalizedWordTextNodes(
  combinedText: string,
  textNodes: readonly WordTextNode[],
  tagRanges: readonly TemplateTagRange[],
): readonly string[] {
  let tagIndex = 0;

  return textNodes.map((textNode) => {
    let cursor = textNode.combinedStart;
    let normalizedText = '';

    while (cursor < textNode.combinedEnd) {
      while (tagIndex < tagRanges.length) {
        const currentTagRange = getRequiredTemplateTagRange(tagRanges, tagIndex);

        if (currentTagRange.end > cursor) {
          break;
        }

        tagIndex += 1;
      }

      const tagRange = getTemplateTagRange(tagRanges, tagIndex);

      if (tagRange === undefined || tagRange.start >= textNode.combinedEnd) {
        normalizedText += combinedText.slice(cursor, textNode.combinedEnd);
        break;
      }

      if (cursor < tagRange.start) {
        normalizedText += combinedText.slice(cursor, tagRange.start);
        cursor = tagRange.start;
        continue;
      }

      if (cursor === tagRange.start) {
        normalizedText += tagRange.text;
      }

      cursor = tagRange.end;
    }

    return normalizedText;
  });
}

function getTemplateTagRange(
  tagRanges: readonly TemplateTagRange[],
  tagIndex: number,
): TemplateTagRange | undefined {
  return tagRanges[tagIndex];
}

function getRequiredTemplateTagRange(
  tagRanges: readonly TemplateTagRange[],
  tagIndex: number,
): TemplateTagRange {
  const tagRange = getTemplateTagRange(tagRanges, tagIndex);

  if (tagRange === undefined) {
    throw new Error(`AOSR DOCX template tag range is missing: ${String(tagIndex)}`);
  }

  return tagRange;
}

function getWordTextNodes(xml: string): readonly WordTextNode[] {
  const textNodePattern = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gu;
  const textNodes: WordTextNode[] = [];
  let combinedCursor = 0;
  let textNodeMatch = textNodePattern.exec(xml);

  while (textNodeMatch !== null) {
    const text = textNodeMatch[1] ?? '';
    const fullTextNode = textNodeMatch[0];
    const contentStart = textNodeMatch.index + fullTextNode.indexOf('>') + 1;
    const contentEnd = contentStart + text.length;

    textNodes.push({
      combinedEnd: combinedCursor + text.length,
      combinedStart: combinedCursor,
      contentEnd,
      contentStart,
      text,
    });
    combinedCursor += text.length;
    textNodeMatch = textNodePattern.exec(xml);
  }

  return textNodes;
}

function replaceWordTextNodeContents(
  xml: string,
  textNodes: readonly WordTextNode[],
  normalizedTextNodes: readonly string[],
): string {
  let normalizedXml = xml;

  for (let textNodeIndex = textNodes.length - 1; textNodeIndex >= 0; textNodeIndex -= 1) {
    const textNode = textNodes[textNodeIndex];
    const normalizedText = normalizedTextNodes[textNodeIndex];

    if (
      textNode !== undefined &&
      normalizedText !== undefined &&
      normalizedText !== textNode.text
    ) {
      normalizedXml =
        normalizedXml.slice(0, textNode.contentStart) +
        normalizedText +
        normalizedXml.slice(textNode.contentEnd);
    }
  }

  return normalizedXml;
}

function renderTemplateFragment(template: string, context: TemplateContext): string {
  const tagPattern = createTemplateTagPattern();
  let renderedXml = '';
  let cursor = 0;
  let tagMatch = tagPattern.exec(template);

  while (tagMatch !== null) {
    const tagCommand = getTagCommand(tagMatch);

    if (tagCommand.startsWith('foreach ')) {
      const foreachCommand = parseForeachCommand(tagCommand);
      const blockBoundary = findTemplateBlockBoundary(template, tagPattern.lastIndex, 'foreach');
      const wrappedBlock = getWordParagraphWrappedTemplateBlock({
        blockEndIndex: blockBoundary.endIndex,
        blockStartIndex: tagMatch.index,
        blockTagEndIndex: tagPattern.lastIndex,
        boundaryStartIndex: blockBoundary.startIndex,
        cursor,
        template,
      });
      const blockTemplate =
        wrappedBlock === null
          ? template.slice(tagPattern.lastIndex, blockBoundary.startIndex)
          : wrappedBlock.blockPrefix +
            template.slice(wrappedBlock.bodyStartIndex, blockBoundary.startIndex) +
            wrappedBlock.blockSuffix;
      const collection = toTemplateCollection(
        resolveTemplateValue(context, foreachCommand.collectionPath),
      );

      renderedXml +=
        wrappedBlock === null ? template.slice(cursor, tagMatch.index) : wrappedBlock.staticPrefix;

      if (collection.length > 0) {
        renderedXml += collection
          .map((item) =>
            renderTemplateFragment(blockTemplate, {
              ...context,
              [foreachCommand.itemName]: item,
            }),
          )
          .join('');
      }

      cursor = wrappedBlock === null ? blockBoundary.endIndex : wrappedBlock.cursorEndIndex;
      tagPattern.lastIndex = cursor;
      tagMatch = tagPattern.exec(template);
      continue;
    }

    renderedXml += template.slice(cursor, tagMatch.index);

    if (tagCommand.startsWith('if ')) {
      const blockBoundary = findTemplateBlockBoundary(template, tagPattern.lastIndex, 'if');
      const blockTemplate = template.slice(tagPattern.lastIndex, blockBoundary.startIndex);

      if (evaluateIfCommand(tagCommand, context)) {
        renderedXml += renderTemplateFragment(blockTemplate, context);
      }

      cursor = blockBoundary.endIndex;
      tagPattern.lastIndex = cursor;
      tagMatch = tagPattern.exec(template);
      continue;
    }

    const fieldPath = parseFieldCommand(tagCommand);

    if (fieldPath === null) {
      throw new Error(`Unsupported AOSR DOCX template tag: ${tagCommand}`);
    }

    renderedXml += escapeWordText(stringifyTemplateValue(resolveTemplateValue(context, fieldPath)));
    cursor = tagPattern.lastIndex;
    tagMatch = tagPattern.exec(template);
  }

  return renderedXml + template.slice(cursor);
}

function getWordParagraphWrappedTemplateBlock({
  blockEndIndex,
  blockStartIndex,
  blockTagEndIndex,
  boundaryStartIndex,
  cursor,
  template,
}: {
  readonly blockEndIndex: number;
  readonly blockStartIndex: number;
  readonly blockTagEndIndex: number;
  readonly boundaryStartIndex: number;
  readonly cursor: number;
  readonly template: string;
}): WordParagraphWrappedTemplateBlock | null {
  const openingParagraphStartIndex = findLastWordParagraphStart(template, blockStartIndex);
  const openingParagraphEndIndex = template.indexOf('</w:p>', blockStartIndex);
  const closingParagraphStartIndex = findLastWordParagraphStart(template, boundaryStartIndex);
  const closingParagraphEndIndex = template.indexOf('</w:p>', blockEndIndex);

  if (
    openingParagraphStartIndex === -1 ||
    openingParagraphEndIndex === -1 ||
    closingParagraphStartIndex === -1 ||
    closingParagraphEndIndex === -1
  ) {
    return null;
  }

  const openingParagraphEndExclusive = openingParagraphEndIndex + '</w:p>'.length;
  const closingParagraphEndExclusive = closingParagraphEndIndex + '</w:p>'.length;

  if (
    openingParagraphStartIndex < cursor ||
    blockStartIndex > openingParagraphEndExclusive ||
    closingParagraphStartIndex < openingParagraphStartIndex ||
    blockEndIndex > closingParagraphEndExclusive
  ) {
    return null;
  }

  return {
    blockPrefix: removeLeadingWordTabBeforeBlockTag(
      template.slice(openingParagraphStartIndex, blockStartIndex),
    ),
    blockSuffix: template.slice(blockEndIndex, closingParagraphEndExclusive),
    bodyStartIndex: blockTagEndIndex,
    cursorEndIndex: closingParagraphEndExclusive,
    staticPrefix: template.slice(cursor, openingParagraphStartIndex),
  };
}

function removeLeadingWordTabBeforeBlockTag(blockPrefix: string): string {
  return blockPrefix.replace(/<w:tab\/>(<w:t\b[^>]*>)$/u, '$1');
}

function stabilizeAosrSignatureParagraphs(xml: string): string {
  return xml.replace(/<w:p\b[\s\S]*?<\/w:p>/gu, (paragraph) => {
    if (!paragraph.includes('<w:pBdr>') || !paragraph.includes('<w:bottom')) {
      return paragraph;
    }

    if (!paragraph.includes('<w:pPr>') || paragraph.includes('<w:keepNext')) {
      return paragraph;
    }

    return paragraph.replace('<w:pPr>', '<w:pPr><w:keepNext/><w:keepLines/>');
  });
}

function findLastWordParagraphStart(template: string, beforeIndex: number): number {
  let paragraphStartIndex = template.lastIndexOf('<w:p', beforeIndex);

  while (paragraphStartIndex !== -1) {
    const paragraphStartSuffix = template.at(paragraphStartIndex + '<w:p'.length);

    if (paragraphStartSuffix === ' ' || paragraphStartSuffix === '>') {
      return paragraphStartIndex;
    }

    paragraphStartIndex = template.lastIndexOf('<w:p', paragraphStartIndex - 1);
  }

  return -1;
}

function findTemplateBlockBoundary(
  template: string,
  startIndex: number,
  blockName: 'foreach' | 'if',
): TemplateBlockBoundary {
  const tagPattern = createTemplateTagPattern();
  let depth = 1;

  tagPattern.lastIndex = startIndex;
  let tagMatch = tagPattern.exec(template);

  while (tagMatch !== null) {
    const tagCommand = getTagCommand(tagMatch);

    if (isOpeningBlockCommand(tagCommand, blockName)) {
      depth += 1;
    }

    if (tagCommand === `/${blockName}`) {
      depth -= 1;

      if (depth === 0) {
        return {
          endIndex: tagPattern.lastIndex,
          startIndex: tagMatch.index,
        };
      }
    }

    tagMatch = tagPattern.exec(template);
  }

  throw new Error(`AOSR DOCX template block is not closed: ${blockName}`);
}

function createTemplateTagPattern(): RegExp {
  return /&lt;&lt;([\s\S]*?)&gt;&gt;/gu;
}

function getTagCommand(tagMatch: RegExpExecArray): string {
  const rawCommand = tagMatch[1];

  if (rawCommand === undefined) {
    return '';
  }

  return rawCommand.trim();
}

function isOpeningBlockCommand(command: string, blockName: 'foreach' | 'if'): boolean {
  return blockName === 'foreach' ? command.startsWith('foreach ') : command.startsWith('if ');
}

function parseForeachCommand(command: string): {
  readonly collectionPath: string;
  readonly itemName: string;
} {
  const foreachMatch = /^foreach\s+\[([A-Za-z_][\w]*)\s+in\s+([\w.]+)\]$/u.exec(command);

  if (foreachMatch === null) {
    throw new Error(`Unsupported AOSR DOCX foreach tag: ${command}`);
  }

  const itemName = foreachMatch[1];
  const collectionPath = foreachMatch[2];

  if (itemName === undefined || collectionPath === undefined) {
    throw new Error(`Unsupported AOSR DOCX foreach tag: ${command}`);
  }

  return { collectionPath, itemName };
}

function parseFieldCommand(command: string): string | null {
  const fieldMatch = /^\[([\w.]+)\]$/u.exec(command);

  return fieldMatch?.[1] ?? null;
}

function evaluateIfCommand(command: string, context: TemplateContext): boolean {
  const ifMatch = /^if\s+\[([\w.]+)\s*!=\s*"([^"]*)"\]$/u.exec(command);

  if (ifMatch === null) {
    throw new Error(`Unsupported AOSR DOCX if tag: ${command}`);
  }

  const fieldPath = ifMatch[1];
  const expectedValue = ifMatch[2];

  if (fieldPath === undefined || expectedValue === undefined) {
    throw new Error(`Unsupported AOSR DOCX if tag: ${command}`);
  }

  return stringifyTemplateValue(resolveTemplateValue(context, fieldPath)) !== expectedValue;
}

function resolveTemplateValue(context: TemplateContext, path: string): unknown {
  return path.split('.').reduce<unknown>((currentValue, pathPart) => {
    if (currentValue === null || typeof currentValue !== 'object') {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[pathPart];
  }, context);
}

function toTemplateCollection(value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as readonly unknown[];
}

function stringifyTemplateValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function escapeWordText(value: string): string {
  return escapeXmlText(value).replace(/\r\n|\r|\n/gu, '</w:t><w:br/><w:t>');
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;');
}

function isRenderableWordXmlEntry(entryName: string): boolean {
  return entryName.startsWith('word/') && entryName.endsWith('.xml');
}
