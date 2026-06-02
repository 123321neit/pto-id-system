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
  readonly actPlace: string;
  readonly attachments: string;
  readonly axes: string;
  readonly documentReferences: string;
  readonly elevationRange: string;
  readonly materialsCertificates: string;
  readonly objectName: string;
  readonly periodEnd: string;
  readonly periodStart: string;
  readonly signatories: readonly DemoAosrSignatory[];
  readonly status: 'draft' | 'needs-review';
  readonly subsequentWorksPermitted: string;
  readonly workDescription: string;
}

export interface DemoAosrSignatory {
  readonly id: string;
  readonly name: string;
  readonly role: string;
}

export type DemoAosrDraftField =
  | 'actDate'
  | 'actNumber'
  | 'actPlace'
  | 'attachments'
  | 'axes'
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
      actPlace: 'г. Екатеринбург',
      attachments:
        'Исполнительная схема ИС-ОВ-04; фотофиксация скрытых участков; журнал входного контроля.',
      axes: 'оси 1-4 / А-В',
      documentReferences: 'РД-ОВ-12 лист 4, РД-ОВ-14 лист 2',
      elevationRange: 'отм. +3.200 - +3.850',
      id: 'aosr-draft-001',
      materialsCertificates:
        'Воздуховоды оцинкованные, сертификат М-2026-17; крепеж КМ-12, паспорт П-48',
      objectName: 'Венткамера ВК-1, участок приточной вентиляции',
      periodEnd: '2026-05-31',
      periodStart: '2026-05-28',
      signatories: [
        {
          id: 'signatory-contractor-001',
          name: 'Иванов И.И.',
          role: 'Представитель лица, осуществляющего строительство',
        },
        {
          id: 'signatory-builder-control-001',
          name: 'Петров П.П.',
          role: 'Представитель строительного контроля',
        },
        {
          id: 'signatory-author-001',
          name: 'Смирнова С.С.',
          role: 'Представитель авторского надзора',
        },
      ],
      status: 'draft',
      subsequentWorksPermitted:
        'Разрешается производство последующих работ по устройству теплоизоляции и облицовки.',
      workDescription:
        'Монтаж скрытых участков воздуховодов до закрытия теплоизоляцией и облицовкой.',
    },
    {
      actDate: '2026-06-03',
      actNumber: 'АОСР-002',
      actPlace: 'г. Екатеринбург',
      attachments: 'Схема расположения гильз; фотофиксация до заделки отверстий.',
      axes: 'оси 5-7 / Г-Д',
      documentReferences: 'РД-ВК-03 лист 7',
      elevationRange: 'отм. 0.000 - +0.600',
      id: 'aosr-draft-002',
      materialsCertificates:
        'Гильзы стальные, сертификат Г-091; противопожарный состав, паспорт ПП-22',
      objectName: 'Стояк В2, санитарный блок 1 этажа',
      periodEnd: '2026-06-02',
      periodStart: '2026-06-01',
      signatories: [
        {
          id: 'signatory-contractor-002',
          name: 'Сидоров С.С.',
          role: 'Представитель лица, осуществляющего строительство',
        },
        {
          id: 'signatory-customer-002',
          name: 'Кузнецова А.А.',
          role: 'Представитель заказчика',
        },
        {
          id: 'signatory-control-002',
          name: 'Орлов О.О.',
          role: 'Представитель строительного контроля',
        },
      ],
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
