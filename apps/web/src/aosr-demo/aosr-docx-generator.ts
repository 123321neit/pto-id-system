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

interface AosrDocxDownloadOptions {
  readonly browserDocument?: Document;
  readonly browserUrl?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>;
  readonly templateUrl?: string;
}

export async function generateAosrDocxBlob(
  printState: AosrPrintState,
  templateUrl = AOSR_DOCX_TEMPLATE_URL,
): Promise<Blob> {
  const templateResponse = await fetch(templateUrl);

  if (!templateResponse.ok) {
    throw new Error(`AOSR DOCX template request failed: ${String(templateResponse.status)}`);
  }

  const templateData = buildAosrDocxTemplateData(printState);
  const templateBuffer = await templateResponse.arrayBuffer();
  const templateEntries = unzipSync(new Uint8Array(templateBuffer));
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

  return new Blob([zipSync(renderedEntries)], { type: DOCX_MIME_TYPE });
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
  return renderTemplateFragment(xml, data as unknown as TemplateContext);
}

function renderTemplateFragment(template: string, context: TemplateContext): string {
  const tagPattern = createTemplateTagPattern();
  let renderedXml = '';
  let cursor = 0;
  let tagMatch = tagPattern.exec(template);

  while (tagMatch !== null) {
    const tagCommand = getTagCommand(tagMatch);
    renderedXml += template.slice(cursor, tagMatch.index);

    if (tagCommand.startsWith('foreach ')) {
      const foreachCommand = parseForeachCommand(tagCommand);
      const blockBoundary = findTemplateBlockBoundary(template, tagPattern.lastIndex, 'foreach');
      const blockTemplate = template.slice(tagPattern.lastIndex, blockBoundary.startIndex);
      const collection = toTemplateCollection(
        resolveTemplateValue(context, foreachCommand.collectionPath),
      );

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

      cursor = blockBoundary.endIndex;
      tagPattern.lastIndex = cursor;
      tagMatch = tagPattern.exec(template);
      continue;
    }

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
