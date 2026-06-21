import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';

export type DemoObjectPeriodId = 'period-2026-09' | 'period-2026-10';

export interface DemoObjectPeriod {
  readonly draftIds: readonly string[];
  readonly id: DemoObjectPeriodId;
  readonly name: string;
  readonly periodicIdTitle: string;
  readonly registryTitle: string;
}

export type DemoObjectPeriods = readonly DemoObjectPeriod[];

export const defaultDemoObjectPeriod: DemoObjectPeriod = {
  draftIds: ['aosr-draft-001'],
  id: 'period-2026-09',
  name: 'Сентябрь 2026',
  periodicIdTitle: 'Промежуточная ИД: Сентябрь 2026',
  registryTitle: 'Реестр папки «Сентябрь 2026»',
};

export const demoObjectPeriods: readonly DemoObjectPeriod[] = [
  defaultDemoObjectPeriod,
  {
    draftIds: ['aosr-draft-002'],
    id: 'period-2026-10',
    name: 'Октябрь 2026',
    periodicIdTitle: 'Промежуточная ИД: Октябрь 2026',
    registryTitle: 'Реестр папки «Октябрь 2026»',
  },
];

export function getDemoObjectPeriodById(
  periodId: DemoObjectPeriodId,
  periods: DemoObjectPeriods = demoObjectPeriods,
): DemoObjectPeriod {
  const period = periods.find((candidate) => candidate.id === periodId);

  if (period === undefined) {
    throw new Error(`Unknown demo object period: ${periodId}`);
  }

  return period;
}

export function getDemoObjectPeriodForDraftId(
  draftId: string,
  periods: DemoObjectPeriods = demoObjectPeriods,
): DemoObjectPeriod {
  const period = periods.find((candidate) => candidate.draftIds.includes(draftId));

  if (period === undefined) {
    return defaultDemoObjectPeriod;
  }

  return period;
}

export function getDemoObjectPeriodDrafts(
  period: DemoObjectPeriod,
  drafts: readonly DemoAosrDraft[],
): readonly DemoAosrDraft[] {
  return drafts.filter((draft) => period.draftIds.includes(draft.id));
}

export function addDemoObjectPeriodDraft(
  periods: DemoObjectPeriods,
  periodId: DemoObjectPeriodId,
  draftId: string,
): DemoObjectPeriods {
  return periods.map((period) =>
    period.id === periodId ? { ...period, draftIds: [...period.draftIds, draftId] } : period,
  );
}
