import type { DemoActTypeId } from '../act-types/act-types.js';
import type {
  DemoAosrDraft,
  DemoDocumentNumberingAssignment,
  DemoDocumentNumberingMode,
  DemoDocumentNumberingScope,
  DemoDocumentNumberingSequences,
} from '../aosr-demo/demo-aosr-workspace.js';
import type { DemoDocumentationSectionId } from './object-documentation-sections.js';
import {
  getDemoIdFolderById,
  getDemoIdFolderDrafts,
  type DemoIdFolder,
  type DemoIdFolderId,
} from './object-id-folders.js';

export type { DemoDocumentNumberingScope } from '../aosr-demo/demo-aosr-workspace.js';

export interface DemoDocumentNumberingSetting {
  readonly documentTypeId: DemoActTypeId;
  readonly mode: DemoDocumentNumberingMode;
  readonly prefix: string;
  readonly scope: DemoDocumentNumberingScope;
  readonly start: number;
  readonly suffix: string;
  readonly template: '{prefix}{number}{suffix}';
}

export interface DemoDocumentNumberingInput {
  readonly documentTypeId: DemoActTypeId;
  readonly drafts: readonly DemoAosrDraft[];
  readonly folderId: DemoIdFolderId;
  readonly folders: readonly DemoIdFolder[];
  readonly sectionId?: DemoDocumentationSectionId;
  readonly setting?: DemoDocumentNumberingSetting;
}

export interface DemoDocumentNumberProposal {
  readonly numberingAssignment: DemoDocumentNumberingAssignment;
  readonly renderedNumber: string;
  readonly sequences?: DemoDocumentNumberingSequences;
}

export const demoAosrNumberingSetting: DemoDocumentNumberingSetting = {
  documentTypeId: 'aosr',
  mode: 'automatic',
  prefix: 'ОВ-',
  scope: 'global-section',
  start: 1,
  suffix: '',
  template: '{prefix}{number}{suffix}',
};

const demoDocumentNumberingSettings: Readonly<Record<DemoActTypeId, DemoDocumentNumberingSetting>> =
  {
    aosr: demoAosrNumberingSetting,
  };

export function getProposedDemoDocumentNumber(input: DemoDocumentNumberingInput): string {
  return getProposedDemoDocumentNumberDetails(input).renderedNumber;
}

export function getProposedDemoDocumentNumberDetails(
  input: DemoDocumentNumberingInput,
): DemoDocumentNumberProposal {
  const setting = input.setting ?? demoDocumentNumberingSettings[input.documentTypeId];

  if (setting.mode === 'manual') {
    return {
      numberingAssignment: { source: 'manual' },
      renderedNumber: '',
    };
  }

  const numberingStart = normalizeNumberingStart(setting.start);
  const sectionDrafts =
    input.sectionId === undefined
      ? input.drafts
      : input.drafts.filter((draft) => draft.sectionId === input.sectionId);
  const folderDrafts = getDemoIdFolderDrafts(
    getDemoIdFolderById(input.folderId, input.folders),
    input.drafts,
  );
  const sequences = {
    section: getNextAutomaticSequence(sectionDrafts, 'section', numberingStart),
    folder: getNextAutomaticSequence(folderDrafts, 'folder', numberingStart),
  };
  const selectedSequence = getSelectedAutomaticSequence(setting.scope, sequences);

  return {
    numberingAssignment: { automaticSequences: sequences, source: 'automatic' },
    renderedNumber: formatDemoDocumentNumber(setting, selectedSequence),
    sequences,
  };
}

function getSelectedAutomaticSequence(
  scope: DemoDocumentNumberingScope,
  sequences: DemoDocumentNumberingSequences,
): number {
  switch (scope) {
    case 'global-section':
      return sequences.section;
    case 'restart-per-folder':
      return sequences.folder;
  }
}

function getNextAutomaticSequence(
  drafts: readonly DemoAosrDraft[],
  sequenceKey: keyof DemoDocumentNumberingSequences,
  numberingStart: number,
): number {
  const usedSequences = drafts
    .map((draft) => draft.numberingAssignment.automaticSequences?.[sequenceKey])
    .filter((sequence): sequence is number => sequence !== undefined);

  return Math.max(numberingStart - 1, ...usedSequences) + 1;
}

function formatDemoDocumentNumber(setting: DemoDocumentNumberingSetting, sequence: number): string {
  return `${setting.prefix}${String(sequence)}${setting.suffix}`;
}

function normalizeNumberingStart(numberingStart: number): number {
  return Number.isInteger(numberingStart) && numberingStart > 0 ? numberingStart : 1;
}
