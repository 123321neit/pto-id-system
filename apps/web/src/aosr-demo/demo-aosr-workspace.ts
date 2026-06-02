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
  readonly defaultProjectDocumentation: string;
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly representativeLibrary: readonly DemoAosrRepresentative[];
}

export interface DemoAosrHeaderOrganization {
  readonly id: string;
  readonly label: string;
  readonly organizationName: string;
  readonly details: string;
  readonly caption?: string;
}

export interface DemoAosrRepresentative {
  readonly id: string;
  readonly roleLabel: string;
  readonly fullName: string;
  readonly position: string;
  readonly organization: string;
  readonly authorityBasis: string;
  readonly nrsId?: string;
  readonly details?: string;
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
  readonly additionalInfo: string;
  readonly axes: string;
  readonly complianceStatement: string;
  readonly copiesCount: string;
  readonly derivedAttachmentIds: readonly string[];
  readonly elevationRange: string;
  readonly location: string;
  readonly materialCertificateIds: readonly string[];
  readonly periodEnd: string;
  readonly periodStart: string;
  readonly representatives: readonly DemoAosrRepresentative[];
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
  | 'additionalInfo'
  | 'axes'
  | 'complianceStatement'
  | 'copiesCount'
  | 'elevationRange'
  | 'location'
  | 'periodEnd'
  | 'periodStart'
  | 'subsequentWorksPermitted'
  | 'workDescription';

export type DemoAosrObjectDefaultsField =
  | 'defaultProjectDocumentation'
  | 'objectName'
  | 'projectName';

const contractorRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Приказ N 12-П от 10.05.2026',
  fullName: 'Иванов И.И.',
  id: 'representative-contractor-001',
  organization: 'ООО "ПТО Монтаж"',
  position: 'Производитель работ',
  roleLabel: 'Представитель подрядчика',
};

const buildingControlRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Договор строительного контроля N СК-7',
  fullName: 'Петров П.П.',
  id: 'representative-builder-control-001',
  nrsId: 'С-66-212868',
  organization: 'ООО "СтройКонтроль"',
  position: 'Ведущий инженер строительного контроля',
  roleLabel: 'Стройконтроль',
};

const authorSupervisionRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Приказ N АН-3 от 15.05.2026',
  fullName: 'Смирнова С.С.',
  id: 'representative-author-001',
  organization: 'АО "Проектный институт"',
  position: 'Главный специалист авторского надзора',
  roleLabel: 'Авторский надзор',
};

const customerRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Доверенность N З-44 от 01.05.2026',
  fullName: 'Кузнецова А.А.',
  id: 'representative-customer-001',
  organization: 'ГАУЗ СО "Демо-заказчик"',
  position: 'Руководитель проекта',
  roleLabel: 'Представитель заказчика',
};

const initialRepresentativeLibrary: readonly DemoAosrRepresentative[] = [
  contractorRepresentative,
  buildingControlRepresentative,
  authorSupervisionRepresentative,
  customerRepresentative,
];

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
      additionalInfo: 'Дополнительные сведения для демо-акта не требуются.',
      axes: 'оси 1-4 / А-В',
      complianceStatement:
        'Работы выполнены в соответствии с рабочей документацией и требованиями СП 73.13330.2016.',
      copiesCount: '4',
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
      representatives: [
        contractorRepresentative,
        buildingControlRepresentative,
        authorSupervisionRepresentative,
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
      additionalInfo: 'Дополнительные сведения отсутствуют.',
      axes: 'оси 5-7 / Г-Д',
      complianceStatement:
        'Работы выполнены согласно рабочей документации и журналу входного контроля материалов.',
      copiesCount: '3',
      derivedAttachmentIds: ['attachment-photo-vk-1'],
      elevationRange: 'отм. 0.000 - +0.600',
      id: 'aosr-draft-002',
      location: 'Стояк В2, санитарный блок 1 этажа',
      materialCertificateIds: ['certificate-firestop-001'],
      periodEnd: '2026-06-02',
      periodStart: '2026-06-01',
      representatives: [
        contractorRepresentative,
        customerRepresentative,
        buildingControlRepresentative,
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
    defaultProjectDocumentation:
      'Рабочая документация РД-ОВ-12 лист 4; РД-ОВ-14 лист 2; спецификация оборудования и материалов СП-ОВ-02.',
    headerOrganizations: [
      {
        caption:
          'Наименование, ОГРН, ИНН, место нахождения, телефон/факс и иные объектовые реквизиты.',
        details:
          'ОГРН 1026600000000; ИНН 6670000000; 620000, г. Екатеринбург, ул. Демонстрационная, 10.',
        id: 'header-organization-customer',
        label: 'Заказчик',
        organizationName: 'ГАУЗ СО "Демо-заказчик"',
      },
      {
        caption: 'Реквизиты лица, осуществляющего строительство, включая СРО при наличии.',
        details: 'ОГРН 1206600007877; ИНН 6670490954; АСРО "Гильдия строителей демо-объекта".',
        id: 'header-organization-contractor',
        label: 'Подрядчик',
        organizationName: 'ООО "ПТО Монтаж"',
      },
      {
        caption: 'Блок можно переименовать или заменить под конкретный объект.',
        details:
          'Договор строительного контроля N СК-7; 620100, г. Екатеринбург, ул. Контрольная, 4.',
        id: 'header-organization-control',
        label: 'Технический заказчик',
        organizationName: 'ООО "СтройКонтроль"',
      },
    ],
    objectName: 'Реконструкция поликлиники, корпус Б',
    projectName: 'Реконструкция поликлиники, демонстрационный проект',
    representativeLibrary: initialRepresentativeLibrary,
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

export function addHeaderOrganizationBlock(
  objectDefaults: DemoAosrObjectDefaults,
  headerOrganization: DemoAosrHeaderOrganization,
): DemoAosrObjectDefaults {
  return {
    ...objectDefaults,
    headerOrganizations: [...objectDefaults.headerOrganizations, headerOrganization],
  };
}

export function moveHeaderOrganizationBlock(
  objectDefaults: DemoAosrObjectDefaults,
  headerOrganizationId: string,
  direction: 'up' | 'down',
): DemoAosrObjectDefaults {
  return {
    ...objectDefaults,
    headerOrganizations: moveItemById(
      objectDefaults.headerOrganizations,
      headerOrganizationId,
      direction,
    ),
  };
}

export function addRepresentativeToLibrary(
  objectDefaults: DemoAosrObjectDefaults,
  representative: DemoAosrRepresentative,
): DemoAosrObjectDefaults {
  if (objectDefaults.representativeLibrary.some(({ id }) => id === representative.id)) {
    return objectDefaults;
  }

  return {
    ...objectDefaults,
    representativeLibrary: [...objectDefaults.representativeLibrary, representative],
  };
}

export function addRepresentativeToDraft(
  draft: DemoAosrDraft,
  representative: DemoAosrRepresentative,
): DemoAosrDraft {
  if (draft.representatives.some(({ id }) => id === representative.id)) {
    return draft;
  }

  return {
    ...draft,
    representatives: [...draft.representatives, representative],
  };
}

export function removeRepresentativeFromDraft(
  draft: DemoAosrDraft,
  representativeId: string,
): DemoAosrDraft {
  return {
    ...draft,
    representatives: draft.representatives.filter(({ id }) => id !== representativeId),
  };
}

export function moveRepresentativeInDraft(
  draft: DemoAosrDraft,
  representativeId: string,
  direction: 'up' | 'down',
): DemoAosrDraft {
  return {
    ...draft,
    representatives: moveItemById(draft.representatives, representativeId, direction),
  };
}

export function reorderDraftRepresentatives(
  draft: DemoAosrDraft,
  representativeId: string,
  targetRepresentativeId: string,
): DemoAosrDraft {
  return {
    ...draft,
    representatives: moveItemBefore(
      draft.representatives,
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

export function getDraftRepresentatives(draft: DemoAosrDraft): readonly DemoAosrRepresentative[] {
  return draft.representatives;
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

export function getDraftDerivedAttachments(
  draft: DemoAosrDraft,
  attachmentLibrary: readonly DemoDerivedAttachment[],
): readonly DemoDerivedAttachment[] {
  return draft.derivedAttachmentIds.flatMap((attachmentId) => {
    const attachment = attachmentLibrary.find(({ id }) => id === attachmentId);

    return attachment === undefined ? [] : [attachment];
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

  const derivedApplications = getDraftDerivedAttachments(draft, attachmentLibrary).map(
    (attachment) => ({
      id: `application-${attachment.id}`,
      source: attachment.reference,
      title: attachment.title,
    }),
  );

  return [...certificateApplications, ...derivedApplications];
}

function moveItemById<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  id: string,
  direction: 'up' | 'down',
): readonly TItem[] {
  const currentIndex = items.findIndex((item) => item.id === id);

  if (currentIndex < 0) {
    return items;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const currentItem = nextItems[currentIndex];
  const targetItem = nextItems[targetIndex];

  if (currentItem === undefined || targetItem === undefined) {
    return items;
  }

  nextItems[currentIndex] = targetItem;
  nextItems[targetIndex] = currentItem;

  return nextItems;
}

function moveItemBefore<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  itemId: string,
  targetItemId: string,
): readonly TItem[] {
  const itemIndex = items.findIndex((item) => item.id === itemId);
  const targetIndex = items.findIndex((item) => item.id === targetItemId);

  if (itemIndex < 0 || targetIndex < 0 || itemIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(itemIndex, 1);

  if (item === undefined) {
    return items;
  }

  const adjustedTargetIndex = itemIndex < targetIndex ? targetIndex - 1 : targetIndex;
  nextItems.splice(adjustedTargetIndex, 0, item);

  return nextItems;
}
