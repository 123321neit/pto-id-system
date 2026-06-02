export interface DemoAosrWorkspace {
  readonly id: string;
  readonly name: string;
  readonly projectCode: string;
  readonly ownerName: string;
  readonly demoNotice: string;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly certificateLibrary: readonly DemoMaterialCertificate[];
  readonly derivedAttachmentLibrary: readonly DemoDerivedAttachment[];
  readonly drafts: readonly DemoAosrDraft[];
}

export interface DemoAosrObjectDefaults {
  readonly projectName: string;
  readonly objectName: string;
  readonly companySummary: string;
  readonly defaultProjectDocumentation: string;
  readonly representativeLibrary: readonly DemoAosrRepresentative[];
}

export interface DemoAosrRepresentative {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  readonly basis: string;
}

export interface DemoMaterialCertificate {
  readonly id: string;
  readonly materialName: string;
  readonly certificateNumber: string;
  readonly documentName: string;
}

export interface DemoDerivedAttachment {
  readonly id: string;
  readonly title: string;
  readonly reference: string;
  readonly type: 'executive-scheme' | 'photo' | 'journal';
}

export interface DemoAosrDraft {
  readonly id: string;
  readonly actDate: string;
  readonly actNumber: string;
  readonly actPlace: string;
  readonly axes: string;
  readonly derivedAttachmentIds: readonly string[];
  readonly elevationRange: string;
  readonly location: string;
  readonly materialCertificateIds: readonly string[];
  readonly periodEnd: string;
  readonly periodStart: string;
  readonly representativeIds: readonly string[];
  readonly status: 'draft' | 'needs-review';
  readonly subsequentWorksPermitted: string;
  readonly workDescription: string;
}

export interface DemoActApplication {
  readonly id: string;
  readonly title: string;
  readonly source: string;
}

export type DemoAosrDraftField =
  | 'actDate'
  | 'actNumber'
  | 'actPlace'
  | 'axes'
  | 'elevationRange'
  | 'location'
  | 'periodEnd'
  | 'periodStart'
  | 'subsequentWorksPermitted'
  | 'workDescription';

export type DemoAosrObjectDefaultsField =
  | 'companySummary'
  | 'defaultProjectDocumentation'
  | 'objectName'
  | 'projectName';

export const demoAosrWorkspace: DemoAosrWorkspace = {
  certificateLibrary: [
    {
      certificateNumber: 'СТ-ОВ-2026-017',
      documentName: 'Сертификат соответствия N СТ-ОВ-2026-017 от 12.05.2026',
      id: 'certificate-ducts-001',
      materialName: 'Воздуховоды оцинкованные 0,7 мм',
    },
    {
      certificateNumber: 'ПС-КМ-48',
      documentName: 'Паспорт качества N ПС-КМ-48 от 18.05.2026',
      id: 'certificate-fasteners-001',
      materialName: 'Крепежные элементы КМ-12',
    },
    {
      certificateNumber: 'ДС-ИЗ-2026-04',
      documentName: 'Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026',
      id: 'certificate-insulation-001',
      materialName: 'Теплоизоляционные маты ИЗ-50',
    },
    {
      certificateNumber: 'ПП-ОГН-22',
      documentName: 'Паспорт партии N ПП-ОГН-22 от 21.05.2026',
      id: 'certificate-firestop-001',
      materialName: 'Противопожарный состав для проходок',
    },
  ],
  demoNotice: 'ДЕМО / демонстрационные данные / не для работы в продуктиве',
  derivedAttachmentLibrary: [
    {
      id: 'attachment-scheme-ov-04',
      reference: 'ИС-ОВ-04',
      title: 'Исполнительная схема скрытых участков вентиляции',
      type: 'executive-scheme',
    },
    {
      id: 'attachment-photo-vk-1',
      reference: 'ФФ-ОВ-11',
      title: 'Фотофиксация скрытых участков ВК-1 до закрытия',
      type: 'photo',
    },
    {
      id: 'attachment-journal-input-control',
      reference: 'ЖВК-2026-05',
      title: 'Запись журнала входного контроля материалов',
      type: 'journal',
    },
  ],
  drafts: [
    {
      actDate: '2026-06-01',
      actNumber: 'АОСР-001',
      actPlace: 'г. Екатеринбург',
      axes: 'оси 1-4 / А-В',
      derivedAttachmentIds: [
        'attachment-scheme-ov-04',
        'attachment-photo-vk-1',
        'attachment-journal-input-control',
      ],
      elevationRange: 'отм. +3.200 - +3.850',
      id: 'aosr-draft-001',
      location: 'Венткамера ВК-1, участок приточной вентиляции',
      materialCertificateIds: ['certificate-ducts-001', 'certificate-fasteners-001'],
      periodEnd: '2026-05-31',
      periodStart: '2026-05-28',
      representativeIds: [
        'representative-contractor-001',
        'representative-builder-control-001',
        'representative-author-001',
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
      axes: 'оси 5-7 / Г-Д',
      derivedAttachmentIds: ['attachment-photo-vk-1'],
      elevationRange: 'отм. 0.000 - +0.600',
      id: 'aosr-draft-002',
      location: 'Стояк В2, санитарный блок 1 этажа',
      materialCertificateIds: ['certificate-firestop-001'],
      periodEnd: '2026-06-02',
      periodStart: '2026-06-01',
      representativeIds: [
        'representative-contractor-001',
        'representative-customer-001',
        'representative-builder-control-001',
      ],
      status: 'needs-review',
      subsequentWorksPermitted:
        'Разрешается производство последующих работ по заделке отверстий в перекрытии.',
      workDescription: 'Установка гильз трубопроводов перед заделкой отверстий в перекрытии.',
    },
  ],
  id: 'workspace-demo-aosr',
  name: 'Демо-рабочая область АОСР',
  objectDefaults: {
    companySummary:
      'Заказчик: ГАУЗ СО "Демо-заказчик"; генподрядчик: ООО "Демо-строй"; подрядчик: ООО "ПТО Монтаж".',
    defaultProjectDocumentation:
      'Рабочая документация РД-ОВ-12 лист 4; РД-ОВ-14 лист 2; спецификация оборудования и материалов СП-ОВ-02.',
    objectName: 'Реконструкция поликлиники, корпус Б',
    projectName: 'Реконструкция поликлиники, демонстрационный проект',
    representativeLibrary: [
      {
        basis: 'Приказ N 12-П от 10.05.2026',
        company: 'ООО "ПТО Монтаж"',
        id: 'representative-contractor-001',
        name: 'Иванов И.И.',
        role: 'Представитель лица, осуществляющего строительство',
      },
      {
        basis: 'Договор строительного контроля N СК-7',
        company: 'ООО "СтройКонтроль"',
        id: 'representative-builder-control-001',
        name: 'Петров П.П.',
        role: 'Представитель строительного контроля',
      },
      {
        basis: 'Приказ N АН-3 от 15.05.2026',
        company: 'АО "Проектный институт"',
        id: 'representative-author-001',
        name: 'Смирнова С.С.',
        role: 'Представитель авторского надзора',
      },
      {
        basis: 'Доверенность N З-44 от 01.05.2026',
        company: 'ГАУЗ СО "Демо-заказчик"',
        id: 'representative-customer-001',
        name: 'Кузнецова А.А.',
        role: 'Представитель заказчика',
      },
    ],
  },
  ownerName: 'Демо-владелец',
  projectCode: 'PTO-DEMO-2026',
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

export function updateDemoObjectDefaultsField(
  objectDefaults: DemoAosrObjectDefaults,
  field: DemoAosrObjectDefaultsField,
  value: string,
): DemoAosrObjectDefaults {
  return {
    ...objectDefaults,
    [field]: value,
  };
}

export function addRepresentativeToDraft(
  draft: DemoAosrDraft,
  representativeId: string,
): DemoAosrDraft {
  if (draft.representativeIds.includes(representativeId)) {
    return draft;
  }

  return {
    ...draft,
    representativeIds: [...draft.representativeIds, representativeId],
  };
}

export function removeRepresentativeFromDraft(
  draft: DemoAosrDraft,
  representativeId: string,
): DemoAosrDraft {
  return {
    ...draft,
    representativeIds: draft.representativeIds.filter((id) => id !== representativeId),
  };
}

export function moveRepresentativeInDraft(
  draft: DemoAosrDraft,
  representativeId: string,
  direction: 'up' | 'down',
): DemoAosrDraft {
  return {
    ...draft,
    representativeIds: moveId(draft.representativeIds, representativeId, direction),
  };
}

export function reorderDraftRepresentatives(
  draft: DemoAosrDraft,
  representativeId: string,
  targetRepresentativeId: string,
): DemoAosrDraft {
  return {
    ...draft,
    representativeIds: moveIdBefore(
      draft.representativeIds,
      representativeId,
      targetRepresentativeId,
    ),
  };
}

export function addMaterialCertificateToDraft(
  draft: DemoAosrDraft,
  certificateId: string,
): DemoAosrDraft {
  if (draft.materialCertificateIds.includes(certificateId)) {
    return draft;
  }

  return {
    ...draft,
    materialCertificateIds: [...draft.materialCertificateIds, certificateId],
  };
}

export function removeMaterialCertificateFromDraft(
  draft: DemoAosrDraft,
  certificateId: string,
): DemoAosrDraft {
  return {
    ...draft,
    materialCertificateIds: draft.materialCertificateIds.filter((id) => id !== certificateId),
  };
}

export function toggleDerivedAttachmentInDraft(
  draft: DemoAosrDraft,
  attachmentId: string,
): DemoAosrDraft {
  if (draft.derivedAttachmentIds.includes(attachmentId)) {
    return {
      ...draft,
      derivedAttachmentIds: draft.derivedAttachmentIds.filter((id) => id !== attachmentId),
    };
  }

  return {
    ...draft,
    derivedAttachmentIds: [...draft.derivedAttachmentIds, attachmentId],
  };
}

export function getDraftRepresentatives(
  draft: DemoAosrDraft,
  representativeLibrary: readonly DemoAosrRepresentative[],
): readonly DemoAosrRepresentative[] {
  return draft.representativeIds.flatMap((representativeId) => {
    const representative = representativeLibrary.find(({ id }) => id === representativeId);

    return representative === undefined ? [] : [representative];
  });
}

export function getDraftMaterialCertificates(
  draft: DemoAosrDraft,
  certificateLibrary: readonly DemoMaterialCertificate[],
): readonly DemoMaterialCertificate[] {
  return draft.materialCertificateIds.flatMap((certificateId) => {
    const certificate = certificateLibrary.find(({ id }) => id === certificateId);

    return certificate === undefined ? [] : [certificate];
  });
}

export function getDraftApplications(
  draft: DemoAosrDraft,
  certificateLibrary: readonly DemoMaterialCertificate[],
  attachmentLibrary: readonly DemoDerivedAttachment[],
): readonly DemoActApplication[] {
  const certificateApplications = getDraftMaterialCertificates(draft, certificateLibrary).map(
    (certificate) => ({
      id: `application-${certificate.id}`,
      source: 'Сертификат / материал',
      title: `${certificate.documentName} (${certificate.materialName})`,
    }),
  );

  const derivedApplications = draft.derivedAttachmentIds.flatMap((attachmentId) => {
    const attachment = attachmentLibrary.find(({ id }) => id === attachmentId);

    if (attachment === undefined) {
      return [];
    }

    return [
      {
        id: `application-${attachment.id}`,
        source: attachment.reference,
        title: attachment.title,
      },
    ];
  });

  return [...certificateApplications, ...derivedApplications];
}

function moveId(ids: readonly string[], id: string, direction: 'up' | 'down'): readonly string[] {
  const currentIndex = ids.indexOf(id);

  if (currentIndex < 0) {
    return ids;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= ids.length) {
    return ids;
  }

  const nextIds = [...ids];
  const currentId = nextIds[currentIndex];
  const targetId = nextIds[targetIndex];

  if (currentId === undefined || targetId === undefined) {
    return ids;
  }

  nextIds[currentIndex] = targetId;
  nextIds[targetIndex] = currentId;

  return nextIds;
}

function moveIdBefore(ids: readonly string[], id: string, targetId: string): readonly string[] {
  const itemIndex = ids.indexOf(id);
  const targetIndex = ids.indexOf(targetId);

  if (itemIndex < 0 || targetIndex < 0 || itemIndex === targetIndex) {
    return ids;
  }

  const nextIds = [...ids];
  const [item] = nextIds.splice(itemIndex, 1);

  if (item === undefined) {
    return ids;
  }

  const adjustedTargetIndex = itemIndex < targetIndex ? targetIndex - 1 : targetIndex;
  nextIds.splice(adjustedTargetIndex, 0, item);

  return nextIds;
}
