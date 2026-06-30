import type { AosrPrintState } from './demo-aosr-workspace.js';
import { formatDocumentDate } from './demo-aosr-ui.js';

export interface AosrDocxTemplateData extends Omit<AosrPrintState, 'document'> {
  readonly document: AosrPrintState['document'] & {
    readonly numberLine: string;
    readonly dateLine: string;
  };
}

export function buildAosrDocxTemplateData(printState: AosrPrintState): AosrDocxTemplateData {
  const documentNumber = printState.document.number.trim();
  const documentDate = printState.document.date.trim();

  return {
    ...printState,
    document: {
      ...printState.document,
      dateLine: formatAosrDocxDateLine(documentDate),
      numberLine: documentNumber === '' ? '' : `№ ${documentNumber}`,
    },
    work: {
      ...printState.work,
      endDateLine: formatAosrDocxDateLine(printState.work.endDateLine),
      startDateLine: formatAosrDocxDateLine(printState.work.startDateLine),
    },
  };
}

export function buildAosrDocxFileName(printState: AosrPrintState): string {
  const documentNumber = sanitizeFileNameSegment(printState.document.number);

  if (documentNumber === '') {
    return 'АОСР_без_номера.docx';
  }

  const documentDate = sanitizeFileNameSegment(printState.document.date);

  return `АОСР_${documentNumber}_${documentDate === '' ? 'без_даты' : documentDate}.docx`;
}

function sanitizeFileNameSegment(value: string): string {
  return replaceUnsafeFileNameCharacters(value.trim())
    .replace(/\s+/gu, '_')
    .replace(/_+/gu, '_')
    .replace(/-+/gu, '-')
    .replace(/^[-_.]+|[-_.]+$/gu, '');
}

function replaceUnsafeFileNameCharacters(value: string): string {
  const forbiddenFileNameCharacters = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);

  return Array.from(value, (character) => {
    const characterCode = character.charCodeAt(0);

    if (characterCode < 32 || forbiddenFileNameCharacters.has(character)) {
      return '-';
    }

    return character;
  }).join('');
}

function formatAosrDocxDateLine(value: string): string {
  const dateValue = value.trim();

  if (dateValue === '') {
    return '';
  }

  return /^\d{4}-\d{2}-\d{2}$/u.test(dateValue) ? formatDocumentDate(dateValue) : value;
}
