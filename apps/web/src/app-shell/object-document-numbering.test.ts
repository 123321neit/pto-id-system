import { describe, expect, it } from 'vitest';

import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  updateDemoAosrDraftField,
  type DemoAosrDraft,
} from '../aosr-demo/demo-aosr-workspace.js';
import {
  demoAosrNumberingSetting,
  getProposedDemoDocumentNumber,
  getProposedDemoDocumentNumberDetails,
} from './object-document-numbering.js';
import { demoObjectPeriods, type DemoObjectPeriods } from './object-periods.js';

describe('frontend-only object document numbering helper', () => {
  it('proposes the next AOSR number globally by object', () => {
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: demoAosrWorkspace.drafts,
        periodId: 'period-2026-09',
        periods: demoObjectPeriods,
      }),
    ).toBe('ОВ-3');
  });

  it('restarts the displayed sequence in each period while preserving the global sequence', () => {
    expect(
      getProposedDemoDocumentNumberDetails({
        documentTypeId: 'aosr',
        drafts: demoAosrWorkspace.drafts,
        periodId: 'period-2026-10',
        periods: demoObjectPeriods,
        setting: { ...demoAosrNumberingSetting, scope: 'restart-per-period' },
      }),
    ).toEqual({
      renderedNumber: 'ОВ-2',
      sequences: { globalObject: 3, period: 2 },
    });
  });

  it('does not let a manual number shift the automatic sequence', () => {
    const manualDraft = createEmptyDemoAosrDraft({
      actNumber: 'ОВ-99',
      id: 'manual-number-draft',
      numberingAssignment: { source: 'manual' },
      objectDefaults: demoAosrWorkspace.objectDefaults,
    });

    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: [...demoAosrWorkspace.drafts, manualDraft],
        periodId: 'period-2026-09',
        periods: withDraftInPeriod('period-2026-09', manualDraft),
      }),
    ).toBe('ОВ-3');
  });

  it('keeps an allocated automatic position consumed after its number is edited manually', () => {
    const [automaticDraft] = demoAosrWorkspace.drafts;

    if (automaticDraft === undefined) {
      throw new Error('Для теста нужен mock АОСР.');
    }

    const manuallyRenamedDraft = updateDemoAosrDraftField(
      {
        ...automaticDraft,
        actNumber: 'ОВ-3',
        id: 'automatic-then-manual',
        numberingAssignment: {
          automaticSequences: { globalObject: 3, period: 2 },
          source: 'automatic',
        },
      },
      'actNumber',
      '12-3-ОВ',
    );

    expect(manuallyRenamedDraft.numberingAssignment).toEqual({
      automaticSequences: { globalObject: 3, period: 2 },
      source: 'manual',
    });
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: [...demoAosrWorkspace.drafts, manuallyRenamedDraft],
        periodId: 'period-2026-09',
        periods: withDraftInPeriod('period-2026-09', manuallyRenamedDraft),
      }),
    ).toBe('ОВ-4');
  });

  it('applies the prefix and suffix configured in the object template', () => {
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: demoAosrWorkspace.drafts,
        periodId: 'period-2026-09',
        periods: demoObjectPeriods,
        setting: {
          ...demoAosrNumberingSetting,
          prefix: 'АОСР/',
          suffix: '/2026',
        },
      }),
    ).toBe('АОСР/3/2026');
  });
});

function withDraftInPeriod(
  periodId: 'period-2026-09' | 'period-2026-10',
  draft: DemoAosrDraft,
): DemoObjectPeriods {
  return demoObjectPeriods.map((period) =>
    period.id === periodId ? { ...period, draftIds: [...period.draftIds, draft.id] } : period,
  );
}
