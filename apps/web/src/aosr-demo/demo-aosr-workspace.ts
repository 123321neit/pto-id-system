export interface DemoAosrWorkspace {
  readonly id: string;
  readonly name: string;
  readonly projectName: string;
  readonly projectCode: string;
  readonly ownerName: string;
  readonly demoNotice: string;
  readonly drafts: readonly DemoAosrDraft[];
}

export interface DemoAosrDraft {
  readonly id: string;
  readonly actDate: string;
  readonly actNumber: string;
  readonly axes: string;
  readonly contractorRepresentative: string;
  readonly customerRepresentative: string;
  readonly documentReferences: string;
  readonly elevationRange: string;
  readonly materialsCertificates: string;
  readonly objectName: string;
  readonly periodEnd: string;
  readonly periodStart: string;
  readonly status: 'draft' | 'needs-review';
  readonly subsequentWorksPermitted: string;
  readonly workDescription: string;
}

export type DemoAosrDraftField =
  | 'actDate'
  | 'actNumber'
  | 'axes'
  | 'contractorRepresentative'
  | 'customerRepresentative'
  | 'documentReferences'
  | 'elevationRange'
  | 'materialsCertificates'
  | 'objectName'
  | 'periodEnd'
  | 'periodStart'
  | 'subsequentWorksPermitted'
  | 'workDescription';

export const demoAosrWorkspace: DemoAosrWorkspace = {
  demoNotice: 'ДЕМО / демонстрационные данные / не для работы в продуктиве',
  drafts: [
    {
      actDate: '2026-06-01',
      actNumber: 'АОСР-001',
      axes: 'оси 1-4 / А-В',
      contractorRepresentative: 'Иванов И.И., производитель работ ООО "Монтаж Строй"',
      customerRepresentative: 'Петров П.П., инженер строительного контроля',
      documentReferences: 'РД-ОВ-12 лист 4, РД-ОВ-14 лист 2',
      elevationRange: 'отм. +3.200 - +3.850',
      id: 'aosr-draft-001',
      materialsCertificates:
        'Воздуховоды оцинкованные, сертификат М-2026-17; крепеж КМ-12, паспорт П-48',
      objectName: 'Венткамера ВК-1, участок приточной вентиляции',
      periodEnd: '2026-05-31',
      periodStart: '2026-05-28',
      status: 'draft',
      subsequentWorksPermitted:
        'Разрешается производство последующих работ по устройству теплоизоляции и облицовки.',
      workDescription:
        'Монтаж скрытых участков воздуховодов до закрытия теплоизоляцией и облицовкой.',
    },
    {
      actDate: '2026-06-03',
      actNumber: 'АОСР-002',
      axes: 'оси 5-7 / Г-Д',
      contractorRepresentative: 'Сидоров С.С., мастер ООО "Монтаж Строй"',
      customerRepresentative: 'Кузнецова А.А., представитель заказчика',
      documentReferences: 'РД-ВК-03 лист 7',
      elevationRange: 'отм. 0.000 - +0.600',
      id: 'aosr-draft-002',
      materialsCertificates:
        'Гильзы стальные, сертификат Г-091; противопожарный состав, паспорт ПП-22',
      objectName: 'Стояк В2, санитарный блок 1 этажа',
      periodEnd: '2026-06-02',
      periodStart: '2026-06-01',
      status: 'needs-review',
      subsequentWorksPermitted:
        'Разрешается производство последующих работ по заделке отверстий в перекрытии.',
      workDescription: 'Установка гильз трубопроводов перед заделкой отверстий в перекрытии.',
    },
  ],
  id: 'workspace-demo-aosr',
  name: 'Демо-рабочая область АОСР',
  ownerName: 'Демо-владелец',
  projectCode: 'PTO-DEMO-2026',
  projectName: 'Реконструкция поликлиники, демонстрационный проект',
};

export function updateDemoAosrDraftField(
  draft: DemoAosrDraft,
  field: DemoAosrDraftField,
  value: string,
): DemoAosrDraft {
  return {
    ...draft,
    [field]: value,
  };
}
