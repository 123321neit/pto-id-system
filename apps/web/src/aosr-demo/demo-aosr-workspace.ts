export interface DemoAosrWorkspace {
  readonly id: string;
  readonly name: string;
  readonly projectCode: string;
  readonly ownerName: string;
  readonly demoNotice: string;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly objectDocumentLibrary: readonly DemoObjectDocument[];
  readonly drafts: readonly DemoAosrDraft[];
}

export interface DemoGlobalOrganization {
  readonly id: string;
  readonly organizationName: string;
  readonly details: string;
  readonly caption: string;
}

export interface DemoAosrObjectDefaults {
  readonly defaultComplianceStatement: string;
  readonly projectName: string;
  readonly objectName: string;
  readonly defaultProjectDocumentation: string;
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly representativeLibrary: readonly DemoAosrRepresentative[];
}

export interface DemoAosrHeaderOrganization {
  readonly id: string;
  readonly globalOrganizationId?: string;
  readonly label: string;
  readonly organizationName: string;
  readonly details: string;
  readonly caption?: string;
}

export interface DemoAosrRepresentative {
  readonly id: string;
  readonly globalRepresentativeId?: string;
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

export type DemoObjectDocumentType =
  | 'Исполнительная схема'
  | 'Исполнительный чертеж'
  | 'Протокол'
  | 'Журнал'
  | 'Испытание'
  | 'Другое';

export interface DemoObjectDocument {
  readonly id: string;
  readonly documentDate: string;
  readonly reference: string;
  readonly title: string;
  readonly type: DemoObjectDocumentType;
}

export interface DemoAosrDraft {
  readonly id: string;
  readonly actDate: string;
  readonly actNumber: string;
  readonly additionalInfo: string;
  readonly axes: string;
  readonly complianceStatementOverride?: string;
  readonly copiesCount: string;
  readonly elevationRange: string;
  readonly excludedApplicationIds: readonly string[];
  readonly materialCertificateIds: readonly string[];
  readonly objectDocumentIds: readonly string[];
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

export const demoObjectDocumentTypes: readonly DemoObjectDocumentType[] = [
  'Исполнительная схема',
  'Исполнительный чертеж',
  'Протокол',
  'Журнал',
  'Испытание',
  'Другое',
];

export type DemoAosrDraftField =
  | 'actDate'
  | 'actNumber'
  | 'additionalInfo'
  | 'axes'
  | 'copiesCount'
  | 'elevationRange'
  | 'periodEnd'
  | 'periodStart'
  | 'subsequentWorksPermitted'
  | 'workDescription';

export type DemoAosrObjectDefaultsField =
  | 'defaultComplianceStatement'
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

export const demoAosrWorkspace: DemoAosrWorkspace = {
  demoNotice: 'ДЕМО / демонстрационные данные / не для работы в продуктиве',
  objectDocumentLibrary: [
    {
      documentDate: '2026-06-01',
      id: 'object-document-scheme-ov-04',
      reference: 'ИС-ОВ-04',
      title: 'Исполнительная схема скрытых участков вентиляции',
      type: 'Исполнительная схема',
    },
    {
      documentDate: '2026-06-01',
      id: 'object-document-drawing-node-02',
      reference: 'ИЧ-ОВ-02',
      title: 'Исполнительный чертеж. Узел прохода воздуховодов через перекрытие',
      type: 'Исполнительный чертеж',
    },
    {
      documentDate: '2026-05-28',
      id: 'object-document-ppr-ventilation',
      reference: 'ППР-ОВ-2026',
      title: 'ППР на монтаж систем вентиляции и кондиционирования',
      type: 'Другое',
    },
    {
      documentDate: '2026-05-20',
      id: 'object-document-project-ov-set',
      reference: 'РД-ОВ-12',
      title: 'Рабочая документация раздела ОВ, листы 4 и 14',
      type: 'Другое',
    },
    {
      documentDate: '2026-05-31',
      id: 'object-document-journal-input-control',
      reference: 'ЖВК-2026-05',
      title: 'Запись журнала входного контроля материалов',
      type: 'Журнал',
    },
    {
      documentDate: '2026-06-02',
      id: 'object-document-protocol-duct-tightness',
      reference: 'ПР-ОВ-07',
      title: 'Протокол проверки герметичности воздуховодов',
      type: 'Протокол',
    },
    {
      documentDate: '2026-06-02',
      id: 'object-document-test-airflow-balancing',
      reference: 'ИСП-ОВ-03',
      title: 'Отчет испытаний и регулировки расхода воздуха',
      type: 'Испытание',
    },
    {
      documentDate: '2026-05-30',
      id: 'object-document-photo-vk-1',
      reference: 'ФФ-ОВ-11',
      title: 'Фотофиксация скрытых участков до закрытия',
      type: 'Другое',
    },
  ],
  drafts: [
    {
      actDate: '2026-09-04',
      actNumber: 'АОСР-001',
      additionalInfo: 'Дополнительные сведения для демо-акта не требуются.',
      axes: 'оси 1-4 / А-В',
      copiesCount: '4',
      elevationRange: 'отм. +3.200 - +3.850',
      excludedApplicationIds: [],
      id: 'aosr-draft-001',
      materialCertificateIds: ['certificate-ducts-001', 'certificate-fasteners-001'],
      objectDocumentIds: ['object-document-scheme-ov-04', 'object-document-journal-input-control'],
      periodEnd: '2026-09-03',
      periodStart: '2026-09-01',
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
      actDate: '2026-10-06',
      actNumber: 'АОСР-002',
      additionalInfo: 'Дополнительные сведения отсутствуют.',
      axes: 'оси 5-7 / Г-Д',
      copiesCount: '3',
      elevationRange: 'отм. 0.000 - +0.600',
      excludedApplicationIds: [],
      id: 'aosr-draft-002',
      materialCertificateIds: ['certificate-firestop-001'],
      objectDocumentIds: ['object-document-project-ov-set'],
      periodEnd: '2026-10-05',
      periodStart: '2026-10-01',
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
    defaultComplianceStatement:
      'Проектной документацией шифр РД-ОВ-12, рабочей документацией РД-ОВ-14, ППР-ОВ-2026, СП 60.13330.2020, СП 73.13330.2016, ГОСТ 34059-2017 и ТУ производителей применённых материалов.',
    defaultProjectDocumentation:
      'Рабочая документация РД-ОВ-12 лист 4; РД-ОВ-14 лист 2; спецификация оборудования и материалов СП-ОВ-02.',
    headerOrganizations: [
      {
        caption:
          'Наименование, ОГРН, ИНН, место нахождения, телефон/факс и иные объектовые реквизиты.',
        details:
          'ОГРН 1026600000000; ИНН 6670000000; 620000, г. Екатеринбург, ул. Демонстрационная, 10.',
        globalOrganizationId: 'global-organization-customer',
        id: 'header-organization-customer',
        label: 'Заказчик',
        organizationName: 'ГАУЗ СО "Демо-заказчик"',
      },
      {
        caption: 'Реквизиты лица, осуществляющего строительство, включая СРО при наличии.',
        details: 'ОГРН 1206600007877; ИНН 6670490954; АСРО "Гильдия строителей демо-объекта".',
        globalOrganizationId: 'global-organization-contractor',
        id: 'header-organization-contractor',
        label: 'Подрядчик',
        organizationName: 'ООО "ПТО Монтаж"',
      },
      {
        caption: 'Блок можно переименовать или заменить под конкретный объект.',
        details:
          'Договор строительного контроля N СК-7; 620100, г. Екатеринбург, ул. Контрольная, 4.',
        globalOrganizationId: 'global-organization-control',
        id: 'header-organization-control',
        label: 'Технический заказчик',
        organizationName: 'ООО "СтройКонтроль"',
      },
    ],
    objectName: 'Реконструкция поликлиники, корпус Б',
    projectName: 'Реконструкция поликлиники, демонстрационный проект',
    representativeLibrary: [],
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

export function getDraftComplianceStatement(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): string {
  return draft.complianceStatementOverride ?? objectDefaults.defaultComplianceStatement;
}

export function hasDraftComplianceOverride(draft: DemoAosrDraft): boolean {
  return draft.complianceStatementOverride !== undefined;
}

export function startDraftComplianceOverride(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): DemoAosrDraft {
  if (hasDraftComplianceOverride(draft)) {
    return draft;
  }

  return {
    ...draft,
    complianceStatementOverride: objectDefaults.defaultComplianceStatement,
  };
}

export function updateDraftComplianceOverride(draft: DemoAosrDraft, value: string): DemoAosrDraft {
  return {
    ...draft,
    complianceStatementOverride: value,
  };
}

export function resetDraftComplianceToObjectDefault(draft: DemoAosrDraft): DemoAosrDraft {
  const { complianceStatementOverride, ...draftWithoutOverride } = draft;

  if (complianceStatementOverride === undefined) {
    return draft;
  }

  return draftWithoutOverride;
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
  if (
    objectDefaults.representativeLibrary.some(
      (existingRepresentative) =>
        existingRepresentative.id === representative.id ||
        (representative.globalRepresentativeId !== undefined &&
          (existingRepresentative.id === representative.globalRepresentativeId ||
            existingRepresentative.globalRepresentativeId ===
              representative.globalRepresentativeId)),
    )
  ) {
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
  const applicationId = getCertificateApplicationId(certificateId);

  return {
    ...draft,
    excludedApplicationIds: draft.excludedApplicationIds.filter((id) => id !== applicationId),
    materialCertificateIds: draft.materialCertificateIds.filter((id) => id !== certificateId),
  };
}

export function addObjectDocumentToDraft(draft: DemoAosrDraft, documentId: string): DemoAosrDraft {
  if (draft.objectDocumentIds.includes(documentId)) {
    return draft;
  }

  return {
    ...draft,
    objectDocumentIds: [...draft.objectDocumentIds, documentId],
  };
}

export function removeObjectDocumentFromDraft(
  draft: DemoAosrDraft,
  documentId: string,
): DemoAosrDraft {
  const applicationId = getObjectDocumentApplicationId(documentId);

  return {
    ...draft,
    excludedApplicationIds: draft.excludedApplicationIds.filter((id) => id !== applicationId),
    objectDocumentIds: draft.objectDocumentIds.filter((id) => id !== documentId),
  };
}

export function toggleApplicationInclusionInDraft(
  draft: DemoAosrDraft,
  applicationId: string,
): DemoAosrDraft {
  if (draft.excludedApplicationIds.includes(applicationId)) {
    return {
      ...draft,
      excludedApplicationIds: draft.excludedApplicationIds.filter((id) => id !== applicationId),
    };
  }

  return {
    ...draft,
    excludedApplicationIds: [...draft.excludedApplicationIds, applicationId],
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

export function getDraftObjectDocuments(
  draft: DemoAosrDraft,
  objectDocumentLibrary: readonly DemoObjectDocument[],
): readonly DemoObjectDocument[] {
  return draft.objectDocumentIds.flatMap((documentId) => {
    const document = objectDocumentLibrary.find(({ id }) => id === documentId);

    return document === undefined ? [] : [document];
  });
}

export function getDraftApplications(
  draft: DemoAosrDraft,
  certificateLibrary: readonly DemoMaterialCertificate[],
  objectDocumentLibrary: readonly DemoObjectDocument[],
): readonly DemoActApplication[] {
  const certificateApplications = getDraftMaterialCertificates(draft, certificateLibrary).map(
    (certificate) => ({
      id: getCertificateApplicationId(certificate.id),
      source: 'Сертификат / материал',
      title: `${certificate.documentName} (${certificate.materialName})`,
    }),
  );

  const documentApplications = getDraftObjectDocuments(draft, objectDocumentLibrary).map(
    (document) => ({
      id: getObjectDocumentApplicationId(document.id),
      source: `${document.type} / ${document.reference}`,
      title: document.title,
    }),
  );

  return [...certificateApplications, ...documentApplications];
}

export function getIncludedDraftApplications(
  draft: DemoAosrDraft,
  certificateLibrary: readonly DemoMaterialCertificate[],
  objectDocumentLibrary: readonly DemoObjectDocument[],
): readonly DemoActApplication[] {
  return getDraftApplications(draft, certificateLibrary, objectDocumentLibrary).filter(
    (application) => !draft.excludedApplicationIds.includes(application.id),
  );
}

function getCertificateApplicationId(certificateId: string): string {
  return `application-certificate-${certificateId}`;
}

function getObjectDocumentApplicationId(documentId: string): string {
  return `application-object-document-${documentId}`;
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
