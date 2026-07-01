import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';

const untitledDocumentLabel = 'Без номера';

export function getDocumentDisplayNumber(documentNumber: string): string {
  return documentNumber.trim() === '' ? untitledDocumentLabel : documentNumber;
}

export function formatRenumberedActCount(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;

  if (mod100 >= 11 && mod100 <= 14) {
    return `${String(count)} актов`;
  }

  if (mod10 === 1) {
    return `${String(count)} акт`;
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return `${String(count)} акта`;
  }

  return `${String(count)} актов`;
}

export function getFolderCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return 'папок';
  }

  if (remainder10 === 1) {
    return 'папка';
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return 'папки';
  }

  return 'папок';
}

export function getActCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return 'актов';
  }

  if (remainder10 === 1) {
    return 'акт';
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return 'акта';
  }

  return 'актов';
}

export function getLatestDraft(drafts: readonly DemoAosrDraft[]): DemoAosrDraft | undefined {
  return [...drafts].sort((left, right) => right.actDate.localeCompare(left.actDate))[0];
}

export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');

  if (year === undefined || month === undefined || day === undefined) {
    return isoDate;
  }

  return `${day}.${month}.${year}`;
}
