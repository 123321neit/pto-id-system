import { getDemoActTypeById, type DemoActTypeId } from '../act-types/act-types.js';
import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  getDemoObjectPeriodDrafts,
  getDemoObjectPeriodForDraftId,
  type DemoObjectPeriod,
  type DemoObjectPeriods,
} from './object-periods.js';

export type DerivedRegistryScope = 'period' | 'final';

export interface RegistrySourceDocument {
  readonly actTypeId: DemoActTypeId;
  readonly documentDate: string;
  readonly documentNumber: string;
  readonly id: string;
  readonly periodName: string;
  readonly workDescription: string;
}

export interface DerivedRegistryRow {
  readonly actTypeId: DemoActTypeId;
  readonly documentDate: string;
  readonly documentNumber: string;
  readonly documentTypeCode: string;
  readonly documentTypeTitle: string;
  readonly id: string;
  readonly periodName: string;
  readonly rowNumber: number;
  readonly workDescription: string;
}

export interface DerivedRegistryModel {
  readonly description: string;
  readonly id: string;
  readonly rows: readonly DerivedRegistryRow[];
  readonly scope: DerivedRegistryScope;
  readonly title: string;
}

export function buildPeriodRegistryModel(
  period: DemoObjectPeriod,
  drafts: readonly DemoAosrDraft[],
): DerivedRegistryModel {
  const periodDrafts = getDemoObjectPeriodDrafts(period, drafts);

  return {
    description:
      'Построен из текущих документов папки. Реестр не сохраняется, не блокируется и не закрывает папку.',
    id: `period-registry-${period.id}`,
    rows: buildDerivedRegistryRows(
      periodDrafts.map((draft) => mapAosrDraftToRegistryDocument(draft, period.name)),
    ),
    scope: 'period',
    title: period.registryTitle,
  };
}

export function buildFinalRegistryModel(
  drafts: readonly DemoAosrDraft[],
  periods: DemoObjectPeriods,
): DerivedRegistryModel {
  return {
    description:
      'Построен из документов всех папок выбранного раздела. Финальный реестр не сохраняется как сущность, не блокируется и не архивируется.',
    id: 'final-registry',
    rows: buildDerivedRegistryRows(
      drafts.map((draft) => {
        const period = getDemoObjectPeriodForDraftId(draft.id, periods);

        return mapAosrDraftToRegistryDocument(draft, period.name);
      }),
    ),
    scope: 'final',
    title: 'Финальный реестр итоговой ИД раздела',
  };
}

export function buildDerivedRegistryRows(
  documents: readonly RegistrySourceDocument[],
): readonly DerivedRegistryRow[] {
  return documents.map((document, index) => {
    const actType = getDemoActTypeById(document.actTypeId);

    return {
      actTypeId: document.actTypeId,
      documentDate: document.documentDate,
      documentNumber: document.documentNumber,
      documentTypeCode: actType.code,
      documentTypeTitle: actType.title,
      id: `registry-row-${document.id}`,
      periodName: document.periodName,
      rowNumber: index + 1,
      workDescription: document.workDescription,
    };
  });
}

function mapAosrDraftToRegistryDocument(
  draft: DemoAosrDraft,
  periodName: string,
): RegistrySourceDocument {
  return {
    actTypeId: 'aosr',
    documentDate: draft.actDate,
    documentNumber: draft.actNumber,
    id: draft.id,
    periodName,
    workDescription: draft.workDescription,
  };
}
