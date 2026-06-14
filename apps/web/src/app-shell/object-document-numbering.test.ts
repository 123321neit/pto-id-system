import { describe, expect, it } from 'vitest';

import { demoAosrWorkspace, type DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  demoAosrNumberingSetting,
  getProposedDemoDocumentNumber,
} from './object-document-numbering.js';
import { demoObjectPeriods, type DemoObjectPeriods } from './object-periods.js';

describe('frontend-only object document numbering helper', () => {
  it('proposes the next AOSR number globally by object for the current mock setting', () => {
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts: demoAosrWorkspace.drafts,
        periodId: 'period-2026-09',
        periods: demoObjectPeriods,
      }),
    ).toBe('ОВ-3');
  });

  it('can restart numbering per period for the future setting model', () => {
    const [firstDraft] = demoAosrWorkspace.drafts;

    if (firstDraft === undefined) {
      throw new Error('Для теста нужен mock АОСР.');
    }

    const [septemberPeriod, octoberPeriod] = demoObjectPeriods;

    if (septemberPeriod === undefined || octoberPeriod === undefined) {
      throw new Error('Для теста нужны два mock-периода.');
    }

    const drafts: readonly DemoAosrDraft[] = [
      { ...firstDraft, actNumber: 'ОВ-1', id: 'period-synthetic-september-1' },
      { ...firstDraft, actNumber: 'ОВ-2', id: 'period-synthetic-september-2' },
      { ...firstDraft, actNumber: 'ОВ-1', id: 'period-synthetic-october-1' },
    ];
    const periods: DemoObjectPeriods = [
      {
        ...septemberPeriod,
        draftIds: ['period-synthetic-september-1', 'period-synthetic-september-2'],
        id: 'period-2026-09',
      },
      {
        ...octoberPeriod,
        draftIds: ['period-synthetic-october-1'],
        id: 'period-2026-10',
      },
    ];

    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts,
        periodId: 'period-2026-10',
        periods,
        setting: { ...demoAosrNumberingSetting, scope: 'global-object' },
      }),
    ).toBe('ОВ-3');
    expect(
      getProposedDemoDocumentNumber({
        documentTypeId: 'aosr',
        drafts,
        periodId: 'period-2026-10',
        periods,
        setting: { ...demoAosrNumberingSetting, scope: 'restart-per-period' },
      }),
    ).toBe('ОВ-2');
  });
});
