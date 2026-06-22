import type { DemoActTypeId } from '../act-types/act-types.js';
import type {
  DemoAosrDraft,
  DemoDocumentNumberingScope,
  DemoDocumentNumberingSequences,
} from '../aosr-demo/demo-aosr-workspace.js';
import {
  getDemoObjectPeriodById,
  getDemoObjectPeriodDrafts,
  type DemoObjectPeriod,
  type DemoObjectPeriodId,
} from './object-periods.js';

export type { DemoDocumentNumberingScope } from '../aosr-demo/demo-aosr-workspace.js';

export interface DemoDocumentNumberingSetting {
  readonly documentTypeId: DemoActTypeId;
  readonly prefix: string;
  readonly scope: DemoDocumentNumberingScope;
  readonly suffix: string;
  readonly template: '{prefix}{number}{suffix}';
}

export interface DemoDocumentNumberingInput {
  readonly documentTypeId: DemoActTypeId;
  readonly drafts: readonly DemoAosrDraft[];
  readonly periodId: DemoObjectPeriodId;
  readonly periods: readonly DemoObjectPeriod[];
  readonly setting?: DemoDocumentNumberingSetting;
}

export interface DemoDocumentNumberProposal {
  readonly renderedNumber: string;
  readonly sequences: DemoDocumentNumberingSequences;
}

export const demoAosrNumberingSetting: DemoDocumentNumberingSetting = {
  documentTypeId: 'aosr',
  prefix: 'ОВ-',
  scope: 'global-object',
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
  const periodDrafts = getDemoObjectPeriodDrafts(
    getDemoObjectPeriodById(input.periodId, input.periods),
    input.drafts,
  );
  const sequences = {
    globalObject: getNextAutomaticSequence(input.drafts, 'globalObject'),
    period: getNextAutomaticSequence(periodDrafts, 'period'),
  };
  const selectedSequence =
    setting.scope === 'global-object' ? sequences.globalObject : sequences.period;

  return {
    renderedNumber: formatDemoDocumentNumber(setting, selectedSequence),
    sequences,
  };
}

function getNextAutomaticSequence(
  drafts: readonly DemoAosrDraft[],
  sequenceKey: keyof DemoDocumentNumberingSequences,
): number {
  const usedSequences = drafts
    .map((draft) => draft.numberingAssignment.automaticSequences?.[sequenceKey])
    .filter((sequence): sequence is number => sequence !== undefined);

  return Math.max(0, ...usedSequences) + 1;
}

function formatDemoDocumentNumber(setting: DemoDocumentNumberingSetting, sequence: number): string {
  return `${setting.prefix}${String(sequence)}${setting.suffix}`;
}
