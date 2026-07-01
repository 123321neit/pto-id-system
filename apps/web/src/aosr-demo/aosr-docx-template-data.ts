import type { AosrPrintState } from './demo-aosr-workspace.js';
import { formatDocumentDate } from './demo-aosr-ui.js';

export const AOSR_MANUAL_FILL_LINE = '\u00a0'.repeat(56);
export const AOSR_MANUAL_FILL_LINES = `${AOSR_MANUAL_FILL_LINE}\n${AOSR_MANUAL_FILL_LINE}`;

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
      additionalInfo: getManualFillValue(printState.document.additionalInfo),
      dateLine: formatAosrDocxDateLine(documentDate),
      numberLine: documentNumber === '' ? '' : `№ ${documentNumber}`,
    },
    applications: {
      ...printState.applications,
      items: getManualFillItems(printState.applications.items),
    },
    confirmationDocuments: {
      ...printState.confirmationDocuments,
      items: getManualFillItems(printState.confirmationDocuments.items),
    },
    materials: {
      ...printState.materials,
      items: getManualFillItems(printState.materials.items),
    },
    project: {
      ...printState.project,
      compliance: getManualFillValue(printState.project.compliance),
      documentation: getManualFillValue(printState.project.documentation),
    },
    representatives: {
      ...printState.representatives,
      groups: printState.representatives.groups.map((group) => ({
        ...group,
        members: group.members.map((member) => ({
          ...member,
          introDisplayText: getManualFillValue(member.introDisplayText),
          signatureName: keepSignatureNameTogether(member.signatureName),
          signatureText: getManualFillValue(member.signatureText),
        })),
      })),
    },
    work: {
      ...printState.work,
      contractorName: getManualFillValue(printState.work.contractorName),
      description: getManualFillValue(printState.work.description),
      endDateLine: formatAosrDocxDateLine(printState.work.endDateLine),
      nextWorks: getManualFillValue(printState.work.nextWorks),
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

function getManualFillValue(value: string): string {
  return value.trim() === '' ? AOSR_MANUAL_FILL_LINES : value;
}

function getManualFillItems(
  items: readonly { readonly displayText: string }[],
): readonly { readonly displayText: string }[] {
  if (items.length === 0) {
    return [{ displayText: AOSR_MANUAL_FILL_LINES }];
  }

  return items.map((item) => ({
    ...item,
    displayText: getManualFillValue(item.displayText),
  }));
}

function keepSignatureNameTogether(value: string): string {
  const signatureName = value.trim().replace(/\s+/gu, '\u00a0');

  return signatureName === '' ? AOSR_MANUAL_FILL_LINE : signatureName;
}

function formatAosrDocxDateLine(value: string): string {
  const dateValue = value.trim();

  if (dateValue === '') {
    return '';
  }

  return /^\d{4}-\d{2}-\d{2}$/u.test(dateValue) ? formatDocumentDate(dateValue) : value;
}
