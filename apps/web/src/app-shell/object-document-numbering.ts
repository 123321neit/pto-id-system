import type { DemoActTypeId } from '../act-types/act-types.js';
import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  getDemoObjectPeriodById,
  getDemoObjectPeriodDrafts,
  type DemoObjectPeriod,
  type DemoObjectPeriodId,
} from './object-periods.js';

export type DemoDocumentNumberingScope = 'global-object' | 'restart-per-period';

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

// Frontend-only numbering foundation. Future UI can expose templates such as
// ОВ-{n}, 12-{n}-ОВ and АОСР/{YYYY}/{n}, with global object numbering or
// numbering restarted per period. No backend/persistence numbering policy here.
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
  const setting = input.setting ?? demoDocumentNumberingSettings[input.documentTypeId];
  const scopedDrafts = getNumberingScopeDrafts(input, setting);
  const usedSequences = scopedDrafts
    .map((draft) => parseDemoDocumentSequence(draft.actNumber, setting))
    .filter((sequence): sequence is number => sequence !== undefined);
  const nextSequence = Math.max(0, ...usedSequences) + 1;

  return formatDemoDocumentNumber(setting, nextSequence);
}

function getNumberingScopeDrafts(
  input: DemoDocumentNumberingInput,
  setting: DemoDocumentNumberingSetting,
): readonly DemoAosrDraft[] {
  if (setting.scope === 'global-object') {
    return input.drafts;
  }

  return getDemoObjectPeriodDrafts(
    getDemoObjectPeriodById(input.periodId, input.periods),
    input.drafts,
  );
}

function formatDemoDocumentNumber(setting: DemoDocumentNumberingSetting, sequence: number): string {
  return `${setting.prefix}${String(sequence)}${setting.suffix}`;
}

function parseDemoDocumentSequence(
  renderedNumber: string,
  setting: DemoDocumentNumberingSetting,
): number | undefined {
  if (!renderedNumber.startsWith(setting.prefix)) {
    return parseTrailingNumber(renderedNumber);
  }

  const withoutPrefix = renderedNumber.slice(setting.prefix.length);
  const numberPart =
    setting.suffix === ''
      ? withoutPrefix
      : withoutPrefix.endsWith(setting.suffix)
        ? withoutPrefix.slice(0, -setting.suffix.length)
        : '';

  if (!/^\d+$/u.test(numberPart)) {
    return parseTrailingNumber(renderedNumber);
  }

  return Number.parseInt(numberPart, 10);
}

function parseTrailingNumber(renderedNumber: string): number | undefined {
  const [, numericPart] = /(\d+)\D*$/u.exec(renderedNumber) ?? [];

  if (numericPart === undefined) {
    return undefined;
  }

  return Number.parseInt(numericPart, 10);
}
