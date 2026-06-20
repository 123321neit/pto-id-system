import {
  demoAosrActType,
  demoAosrFormVariant1,
  type DemoAosrFormVariantId,
} from '../act-types/act-types.js';

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

export interface CounterpartyLibraryItem {
  readonly id: string;
  readonly displayName: string;
  readonly fullText: string;
  readonly defaultSubscript?: string;
  readonly isArchived?: boolean;
}

export interface SignatoryLibraryItem {
  readonly id: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly position?: string;
  readonly organization?: string;
  readonly authorityDocument?: string;
  readonly nrsId?: string;
  readonly introDisplayText: string;
  readonly signatureText: string;
  readonly signatureName: string;
  readonly defaultSubscript?: string;
  readonly isArchived?: boolean;
}

export type ActTemplateMode = 'linked' | 'manual';

export interface DemoAosrObjectDefaults {
  readonly defaultComplianceStatement: string;
  readonly defaultCopiesLine: string;
  readonly projectName: string;
  readonly objectName: string;
  readonly objectNameSubscript: string;
  readonly defaultProjectDocumentation: string;
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly objectTemplate: ObjectTemplate;
  readonly representativeLibrary: readonly DemoAosrRepresentative[];
}

export interface DemoAosrHeaderOrganization {
  readonly id: string;
  readonly globalOrganizationId?: string;
  readonly label: string;
  readonly organizationName: string;
  readonly details: string;
  readonly caption?: string;
  readonly displayText?: string;
}

export interface DemoAosrRepresentative {
  readonly id: string;
  readonly globalRepresentativeId?: string;
  readonly templateGroupId?: string;
  readonly roleLabel: string;
  readonly fullName: string;
  readonly position: string;
  readonly organization: string;
  readonly authorityBasis: string;
  readonly nrsId?: string;
  readonly details?: string;
  readonly introDisplayText?: string;
  readonly signatureText?: string;
  readonly signatureName?: string;
}

export interface ObjectTemplate {
  readonly id: string;
  readonly objectId: string;
  readonly objectName: string;
  readonly objectNameSubscript: string;
  readonly counterparties: readonly {
    readonly id: string;
    readonly title: string;
    readonly counterpartyId: string;
    readonly subscriptMode: 'fromLibrary' | 'custom';
    readonly customSubscript?: string;
  }[];
  readonly representativeGroups: readonly {
    readonly id: string;
    readonly title: string;
    readonly members: readonly {
      readonly id: string;
      readonly signatoryId: string;
      readonly subscriptMode: 'fromLibrary' | 'custom';
      readonly customSubscript?: string;
    }[];
  }[];
  readonly projectDocumentation: string;
  readonly complianceText: string;
  readonly copiesLine: string;
  readonly numberingPattern?: string;
  readonly defaultDateMode?: 'today' | 'folderDate' | 'manual';
}

export interface AosrPrintState {
  readonly object: {
    readonly name: string;
    readonly nameSubscript: string;
  };
  readonly counterparties: readonly {
    readonly title: string;
    readonly displayText: string;
    readonly subscript: string;
  }[];
  readonly document: {
    readonly number: string;
    readonly date: string;
    readonly additionalInfo: string;
    readonly copiesLine: string;
  };
  readonly representatives: {
    readonly groups: readonly {
      readonly title: string;
      readonly members: readonly {
        readonly introDisplayText: string;
        readonly subscript: string;
        readonly signatureText: string;
        readonly signatureName: string;
      }[];
    }[];
  };
  readonly work: {
    readonly contractorName: string;
    readonly description: string;
    readonly startDateLine: string;
    readonly endDateLine: string;
    readonly nextWorks: string;
  };
  readonly project: {
    readonly documentation: string;
    readonly compliance: string;
  };
  readonly materials: {
    readonly items: readonly { readonly displayText: string }[];
  };
  readonly confirmationDocuments: {
    readonly items: readonly { readonly displayText: string }[];
  };
  readonly applications: {
    readonly items: readonly { readonly displayText: string }[];
  };
}

export interface DemoAosrManualTemplateSnapshot {
  readonly object: {
    readonly name: string;
    readonly nameSubscript: string;
  };
  readonly counterparties: readonly {
    readonly title: string;
    readonly displayText: string;
    readonly subscript: string;
  }[];
  readonly representatives: {
    readonly groups: readonly {
      readonly title: string;
      readonly members: readonly {
        readonly introDisplayText: string;
        readonly subscript: string;
        readonly signatureText: string;
        readonly signatureName: string;
      }[];
    }[];
  };
  readonly project: {
    readonly documentation: string;
    readonly compliance: string;
  };
  readonly documentTemplateDefaults: {
    readonly copiesLine: string;
  };
}

export interface DemoAosrTemplateFields {
  readonly complianceStatement: string;
  readonly copiesLine: string;
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly objectName: string;
  readonly objectNameSubscript: string;
  readonly projectDocumentation: string;
  readonly representativeGroups: AosrPrintState['representatives']['groups'];
  readonly representatives: readonly DemoAosrRepresentative[];
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
  // Mock compatibility: these template-owned fields remain on the frontend draft
  // so existing manual editor controls can edit a snapshot. Linked production acts
  // must not persist template-owned copies.
  readonly complianceStatement: string;
  readonly copiesCount: string;
  readonly elevationRange: string;
  readonly excludedApplicationIds: readonly string[];
  readonly formVariantId: DemoAosrFormVariantId;
  readonly formVariantPrintTitle: string;
  readonly formVariantTitle: string;
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly materialCertificateIds: readonly string[];
  readonly materialCertificateSnapshots: readonly DemoMaterialCertificate[];
  readonly documentType: 'AOSR_1';
  readonly objectTemplateId: string;
  readonly templateMode: ActTemplateMode;
  readonly manualTemplateSnapshot?: DemoAosrManualTemplateSnapshot;
  readonly objectName: string;
  readonly objectDocumentIds: readonly string[];
  readonly objectDocumentSnapshots: readonly DemoObjectDocument[];
  readonly periodEnd: string;
  readonly periodStart: string;
  readonly projectDocumentation: string;
  readonly representatives: readonly DemoAosrRepresentative[];
  readonly status: 'draft' | 'needs-review';
  readonly subsequentWorksPermitted: string;
  readonly workContractorName: string;
  readonly workDescription: string;
}

export interface DemoActApplication {
  readonly id: string;
  readonly title: string;
  readonly source: string;
}

export interface CreateDemoAosrDraftInput {
  readonly actNumber: string;
  readonly id: string;
  readonly objectDefaults: DemoAosrObjectDefaults;
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
  | 'complianceStatement'
  | 'copiesCount'
  | 'elevationRange'
  | 'objectName'
  | 'periodEnd'
  | 'periodStart'
  | 'projectDocumentation'
  | 'subsequentWorksPermitted'
  | 'workContractorName'
  | 'workDescription';

export type DemoAosrObjectDefaultsField =
  | 'defaultComplianceStatement'
  | 'defaultCopiesLine'
  | 'defaultProjectDocumentation'
  | 'objectName'
  | 'objectNameSubscript'
  | 'projectName';

const contractorRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Приказ N 12-П от 10.05.2026',
  fullName: 'Иванов И.И.',
  id: 'representative-contractor-001',
  organization: 'ООО "ПТО Монтаж"',
  position: 'Производитель работ',
  roleLabel: 'Представитель подрядчика',
  templateGroupId: 'representative-group-contractor',
};

const buildingControlRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Договор строительного контроля N СК-7',
  fullName: 'Петров П.П.',
  id: 'representative-builder-control-001',
  nrsId: 'С-66-212868',
  organization: 'ООО "СтройКонтроль"',
  position: 'Ведущий инженер строительного контроля',
  roleLabel: 'Стройконтроль',
  templateGroupId: 'representative-group-building-control',
};

const authorSupervisionRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Приказ N АН-3 от 15.05.2026',
  fullName: 'Смирнова С.С.',
  id: 'representative-author-001',
  organization: 'АО "Проектный институт"',
  position: 'Главный специалист авторского надзора',
  roleLabel: 'Авторский надзор',
  templateGroupId: 'representative-group-author-supervision',
};

const customerRepresentative: DemoAosrRepresentative = {
  authorityBasis: 'Доверенность N З-44 от 01.05.2026',
  fullName: 'Кузнецова А.А.',
  id: 'representative-customer-001',
  organization: 'ГАУЗ СО "Демо-заказчик"',
  position: 'Руководитель проекта',
  roleLabel: 'Представитель заказчика',
};

const defaultComplianceStatement =
  'Проектной документацией шифр РД-ОВ-12, рабочей документацией РД-ОВ-14, ППР-ОВ-2026, СП 60.13330.2020, СП 73.13330.2016, ГОСТ 34059-2017 и ТУ производителей применённых материалов.';

const defaultProjectDocumentation =
  'Рабочая документация РД-ОВ-12 лист 4; РД-ОВ-14 лист 2; спецификация оборудования и материалов СП-ОВ-02.';

const defaultObjectName = 'Реконструкция поликлиники, корпус Б';

const defaultObjectNameSubscript =
  'Наименование объекта капитального строительства в соответствии с проектной документацией.';

const defaultCopiesLine = '4';

const defaultHeaderOrganizations: readonly DemoAosrHeaderOrganization[] = [
  {
    caption: 'Наименование, ОГРН, ИНН, место нахождения, телефон/факс и иные объектовые реквизиты.',
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
    details: 'Договор строительного контроля N СК-7; 620100, г. Екатеринбург, ул. Контрольная, 4.',
    globalOrganizationId: 'global-organization-control',
    id: 'header-organization-control',
    label: 'Технический заказчик',
    organizationName: 'ООО "СтройКонтроль"',
  },
];

const defaultObjectTemplate: ObjectTemplate = {
  complianceText: defaultComplianceStatement,
  copiesLine: defaultCopiesLine,
  counterparties: defaultHeaderOrganizations.map((headerOrganization) => ({
    counterpartyId: headerOrganization.globalOrganizationId ?? headerOrganization.id,
    id: headerOrganization.id,
    subscriptMode: headerOrganization.caption === undefined ? 'fromLibrary' : 'custom',
    title: headerOrganization.label,
    ...(headerOrganization.caption === undefined
      ? {}
      : { customSubscript: headerOrganization.caption }),
  })),
  defaultDateMode: 'manual',
  id: 'object-template-demo',
  objectId: 'object-demo',
  objectName: defaultObjectName,
  objectNameSubscript: defaultObjectNameSubscript,
  projectDocumentation: defaultProjectDocumentation,
  representativeGroups: [
    {
      id: 'representative-group-contractor',
      members: [
        {
          id: 'representative-member-contractor-001',
          signatoryId: contractorRepresentative.id,
          subscriptMode: 'fromLibrary',
        },
      ],
      title: contractorRepresentative.roleLabel,
    },
    {
      id: 'representative-group-building-control',
      members: [
        {
          id: 'representative-member-building-control-001',
          signatoryId: buildingControlRepresentative.id,
          subscriptMode: 'fromLibrary',
        },
      ],
      title: buildingControlRepresentative.roleLabel,
    },
    {
      id: 'representative-group-author-supervision',
      members: [
        {
          id: 'representative-member-author-supervision-001',
          signatoryId: authorSupervisionRepresentative.id,
          subscriptMode: 'fromLibrary',
        },
      ],
      title: authorSupervisionRepresentative.roleLabel,
    },
  ],
};

const demoObjectDocumentLibrary: readonly DemoObjectDocument[] = [
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
];

const demoMaterialCertificateSnapshots: Readonly<Record<string, DemoMaterialCertificate>> = {
  'certificate-ducts-001': {
    certificateNumber: 'СТ-ОВ-2026-017',
    documentName: 'Сертификат соответствия N СТ-ОВ-2026-017 от 12.05.2026',
    id: 'certificate-ducts-001',
    materialName: 'Воздуховоды оцинкованные 0,7 мм',
  },
  'certificate-fasteners-001': {
    certificateNumber: 'ПС-КМ-48',
    documentName: 'Паспорт качества N ПС-КМ-48 от 18.05.2026',
    id: 'certificate-fasteners-001',
    materialName: 'Крепежные элементы КМ-12',
  },
  'certificate-firestop-001': {
    certificateNumber: 'ПП-ОГН-22',
    documentName: 'Паспорт партии N ПП-ОГН-22 от 21.05.2026',
    id: 'certificate-firestop-001',
    materialName: 'Противопожарный состав для проходок',
  },
};

function copyHeaderOrganizations(
  headerOrganizations: readonly DemoAosrHeaderOrganization[],
): readonly DemoAosrHeaderOrganization[] {
  return headerOrganizations.map((headerOrganization) => ({ ...headerOrganization }));
}

function getObjectDocumentSnapshots(documentIds: readonly string[]): readonly DemoObjectDocument[] {
  return documentIds.flatMap((documentId) => {
    const document = demoObjectDocumentLibrary.find(({ id }) => id === documentId);

    return document === undefined ? [] : [{ ...document }];
  });
}

function getMaterialCertificateSnapshots(
  certificateIds: readonly string[],
): readonly DemoMaterialCertificate[] {
  return certificateIds.flatMap((certificateId) => {
    const certificate = demoMaterialCertificateSnapshots[certificateId];

    return certificate === undefined ? [] : [{ ...certificate }];
  });
}

export const demoAosrWorkspace: DemoAosrWorkspace = {
  demoNotice: 'ДЕМО / демонстрационные данные / не для работы в продуктиве',
  objectDocumentLibrary: demoObjectDocumentLibrary,
  drafts: [
    {
      actDate: '2026-09-04',
      actNumber: 'ОВ-1',
      additionalInfo: 'Дополнительные сведения для демо-акта не требуются.',
      axes: 'оси 1-4 / А-В',
      complianceStatement: defaultComplianceStatement,
      copiesCount: '4',
      elevationRange: 'отм. +3.200 - +3.850',
      excludedApplicationIds: [],
      formVariantId: demoAosrActType.defaultFormVariantId,
      formVariantPrintTitle: demoAosrFormVariant1.printTitle,
      formVariantTitle: demoAosrFormVariant1.title,
      headerOrganizations: copyHeaderOrganizations(defaultHeaderOrganizations),
      id: 'aosr-draft-001',
      documentType: 'AOSR_1',
      materialCertificateIds: ['certificate-ducts-001', 'certificate-fasteners-001'],
      materialCertificateSnapshots: getMaterialCertificateSnapshots([
        'certificate-ducts-001',
        'certificate-fasteners-001',
      ]),
      objectTemplateId: 'object-template-demo',
      templateMode: 'linked',
      objectName: defaultObjectName,
      objectDocumentIds: ['object-document-scheme-ov-04', 'object-document-journal-input-control'],
      objectDocumentSnapshots: getObjectDocumentSnapshots([
        'object-document-scheme-ov-04',
        'object-document-journal-input-control',
      ]),
      periodEnd: '2026-09-03',
      periodStart: '2026-09-01',
      projectDocumentation: defaultProjectDocumentation,
      representatives: [
        contractorRepresentative,
        buildingControlRepresentative,
        authorSupervisionRepresentative,
      ],
      status: 'draft',
      subsequentWorksPermitted:
        'Разрешается производство последующих работ по устройству теплоизоляции и облицовки.',
      workContractorName: 'ООО "ПТО Монтаж"',
      workDescription:
        'Монтаж скрытых участков воздуховодов до закрытия теплоизоляцией и облицовкой.',
    },
    {
      actDate: '2026-10-06',
      actNumber: 'ОВ-2',
      additionalInfo: 'Дополнительные сведения отсутствуют.',
      axes: 'оси 5-7 / Г-Д',
      complianceStatement: defaultComplianceStatement,
      copiesCount: '3',
      elevationRange: 'отм. 0.000 - +0.600',
      excludedApplicationIds: [],
      formVariantId: demoAosrActType.defaultFormVariantId,
      formVariantPrintTitle: demoAosrFormVariant1.printTitle,
      formVariantTitle: demoAosrFormVariant1.title,
      headerOrganizations: copyHeaderOrganizations(defaultHeaderOrganizations),
      id: 'aosr-draft-002',
      documentType: 'AOSR_1',
      materialCertificateIds: ['certificate-firestop-001'],
      materialCertificateSnapshots: getMaterialCertificateSnapshots(['certificate-firestop-001']),
      objectTemplateId: 'object-template-demo',
      templateMode: 'linked',
      objectName: defaultObjectName,
      objectDocumentIds: ['object-document-project-ov-set'],
      objectDocumentSnapshots: getObjectDocumentSnapshots(['object-document-project-ov-set']),
      periodEnd: '2026-10-05',
      periodStart: '2026-10-01',
      projectDocumentation: defaultProjectDocumentation,
      representatives: [
        contractorRepresentative,
        customerRepresentative,
        buildingControlRepresentative,
      ],
      status: 'needs-review',
      subsequentWorksPermitted:
        'Разрешается производство последующих работ по заделке отверстий в перекрытии.',
      workContractorName: 'ООО "ПТО Монтаж"',
      workDescription: 'Установка гильз трубопроводов перед заделкой отверстий в перекрытии.',
    },
  ],
  id: 'workspace-demo-aosr',
  name: 'Демо-рабочая область АОСР',
  objectDefaults: {
    defaultComplianceStatement,
    defaultCopiesLine,
    defaultProjectDocumentation,
    headerOrganizations: copyHeaderOrganizations(defaultHeaderOrganizations),
    objectTemplate: defaultObjectTemplate,
    objectName: defaultObjectName,
    objectNameSubscript: defaultObjectNameSubscript,
    projectName: 'Реконструкция поликлиники, демонстрационный проект',
    representativeLibrary: [
      contractorRepresentative,
      buildingControlRepresentative,
      authorSupervisionRepresentative,
    ],
  },
  ownerName: 'Демо-владелец',
  projectCode: 'PTO-DEMO-2026',
};

export function createEmptyDemoAosrDraft({
  actNumber,
  id,
  objectDefaults,
}: CreateDemoAosrDraftInput): DemoAosrDraft {
  return {
    actDate: '',
    actNumber,
    additionalInfo: '',
    axes: '',
    complianceStatement: objectDefaults.defaultComplianceStatement,
    copiesCount: '',
    elevationRange: '',
    excludedApplicationIds: [],
    formVariantId: demoAosrActType.defaultFormVariantId,
    formVariantPrintTitle: demoAosrFormVariant1.printTitle,
    formVariantTitle: demoAosrFormVariant1.title,
    headerOrganizations: copyHeaderOrganizations(objectDefaults.headerOrganizations),
    id,
    documentType: 'AOSR_1',
    materialCertificateIds: [],
    materialCertificateSnapshots: [],
    objectTemplateId: objectDefaults.objectTemplate.id,
    templateMode: 'linked',
    objectName: objectDefaults.objectName,
    objectDocumentIds: [],
    objectDocumentSnapshots: [],
    periodEnd: '',
    periodStart: '',
    projectDocumentation: objectDefaults.defaultProjectDocumentation,
    representatives: objectDefaults.representativeLibrary.map((representative) => ({
      ...representative,
    })),
    status: 'draft',
    subsequentWorksPermitted: '',
    workContractorName: '',
    workDescription: '',
  };
}

export function updateDemoAosrDraftField(
  draft: DemoAosrDraft,
  field: DemoAosrDraftField,
  value: string,
): DemoAosrDraft {
  const nextDraft = {
    ...draft,
    [field]: value,
  };

  return syncManualTemplateSnapshotFromDraft(nextDraft);
}

export interface ResolveDemoAosrTemplateFieldsInput {
  readonly counterpartyLibrary?: readonly CounterpartyLibraryItem[];
  readonly draft: DemoAosrDraft;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly signatoryLibrary?: readonly SignatoryLibraryItem[];
}

export interface BuildAosrPrintStateInput extends ResolveDemoAosrTemplateFieldsInput {
  readonly finalApplications: readonly DemoActApplication[];
  readonly selectedMaterials: readonly DemoMaterialCertificate[];
  readonly selectedObjectDocuments: readonly DemoObjectDocument[];
}

export function getObjectTemplateFromDefaults(
  objectDefaults: DemoAosrObjectDefaults,
): ObjectTemplate {
  return objectDefaults.objectTemplate;
}

export function getCounterpartyLibraryItemFromGlobalOrganization(
  organization: DemoGlobalOrganization,
): CounterpartyLibraryItem {
  return {
    defaultSubscript: organization.caption,
    displayName: organization.organizationName,
    fullText: [organization.organizationName, organization.details].filter(Boolean).join(' '),
    id: organization.id,
  };
}

export function getSignatoryLibraryItemFromRepresentative(
  representative: DemoAosrRepresentative,
): SignatoryLibraryItem {
  const signatureText = getRepresentativeSignatureText(representative);
  const introDisplayText = getRepresentativeIntroDisplayText(representative);

  return {
    authorityDocument: representative.authorityBasis,
    ...(representative.details === undefined ? {} : { defaultSubscript: representative.details }),
    displayName: representative.fullName,
    fullName: representative.fullName,
    id: representative.globalRepresentativeId ?? representative.id,
    introDisplayText,
    organization: representative.organization,
    position: representative.position,
    signatureName: representative.signatureName ?? representative.fullName,
    signatureText,
    ...(representative.nrsId === undefined ? {} : { nrsId: representative.nrsId }),
  };
}

export function resolveDemoAosrTemplateFields({
  counterpartyLibrary = [],
  draft,
  objectDefaults,
  signatoryLibrary = [],
}: ResolveDemoAosrTemplateFieldsInput): DemoAosrTemplateFields {
  if (draft.templateMode === 'manual') {
    return {
      complianceStatement: draft.complianceStatement,
      copiesLine: draft.copiesCount,
      headerOrganizations: draft.headerOrganizations,
      objectName: draft.objectName,
      objectNameSubscript:
        draft.manualTemplateSnapshot?.object.nameSubscript ?? objectDefaults.objectNameSubscript,
      projectDocumentation: draft.projectDocumentation,
      representativeGroups:
        draft.manualTemplateSnapshot?.representatives.groups ??
        buildRepresentativePrintGroups(draft.representatives),
      representatives: draft.representatives,
    };
  }

  return resolveLinkedTemplateFields({
    counterpartyLibrary,
    objectDefaults,
    signatoryLibrary,
  });
}

export function buildDemoAosrPrintState({
  counterpartyLibrary = [],
  draft,
  finalApplications,
  objectDefaults,
  selectedMaterials,
  selectedObjectDocuments,
  signatoryLibrary = [],
}: BuildAosrPrintStateInput): AosrPrintState {
  const templateFields = resolveDemoAosrTemplateFields({
    counterpartyLibrary,
    draft,
    objectDefaults,
    signatoryLibrary,
  });
  const manualSnapshot = draft.templateMode === 'manual' ? draft.manualTemplateSnapshot : undefined;

  return {
    applications: {
      items: finalApplications.map((application) => ({
        displayText:
          application.source === 'Сертификат / материал'
            ? application.title
            : `${application.title} ${application.source}`,
      })),
    },
    confirmationDocuments: {
      items: selectedObjectDocuments.map((document) => ({
        displayText: `${document.title} ${document.reference}`,
      })),
    },
    counterparties:
      manualSnapshot?.counterparties ??
      templateFields.headerOrganizations.map((headerOrganization) => ({
        displayText: getHeaderDisplayText(headerOrganization),
        subscript: headerOrganization.caption ?? '',
        title: headerOrganization.label,
      })),
    document: {
      additionalInfo: draft.additionalInfo,
      copiesLine: manualSnapshot?.documentTemplateDefaults.copiesLine ?? templateFields.copiesLine,
      date: draft.actDate,
      number: draft.actNumber,
    },
    materials: {
      items: selectedMaterials.map((certificate) => ({
        displayText: `${certificate.materialName} (${certificate.documentName}, ${certificate.certificateNumber})`,
      })),
    },
    object: {
      name: manualSnapshot?.object.name ?? templateFields.objectName,
      nameSubscript: manualSnapshot?.object.nameSubscript ?? templateFields.objectNameSubscript,
    },
    project: {
      compliance: manualSnapshot?.project.compliance ?? templateFields.complianceStatement,
      documentation: manualSnapshot?.project.documentation ?? templateFields.projectDocumentation,
    },
    representatives: {
      groups: manualSnapshot?.representatives.groups ?? templateFields.representativeGroups,
    },
    work: {
      contractorName: draft.workContractorName,
      description: [draft.workDescription, draft.axes, draft.elevationRange]
        .map((value) => value.trim())
        .filter(Boolean)
        .join('; '),
      endDateLine: draft.periodEnd,
      nextWorks: draft.subsequentWorksPermitted,
      startDateLine: draft.periodStart,
    },
  };
}

export function switchDraftToManualTemplateMode({
  counterpartyLibrary = [],
  draft,
  objectDefaults,
  signatoryLibrary = [],
}: ResolveDemoAosrTemplateFieldsInput): DemoAosrDraft {
  const templateFields = resolveLinkedTemplateFields({
    counterpartyLibrary,
    objectDefaults,
    signatoryLibrary,
  });
  const nextDraft: DemoAosrDraft = {
    ...draft,
    complianceStatement: templateFields.complianceStatement,
    copiesCount: templateFields.copiesLine,
    headerOrganizations: copyHeaderOrganizations(templateFields.headerOrganizations),
    manualTemplateSnapshot: createManualTemplateSnapshot(templateFields),
    objectName: templateFields.objectName,
    projectDocumentation: templateFields.projectDocumentation,
    representatives: templateFields.representatives.map((representative) => ({
      ...representative,
    })),
    templateMode: 'manual',
  };

  return nextDraft;
}

export function returnDraftToLinkedTemplateMode(draft: DemoAosrDraft): DemoAosrDraft {
  const { manualTemplateSnapshot, ...nextDraft } = draft;
  void manualTemplateSnapshot;

  return {
    ...nextDraft,
    templateMode: 'linked',
  };
}

export function isManualDraftFieldDifferentFromObjectTemplate(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
  field: 'complianceStatement' | 'objectName' | 'projectDocumentation',
): boolean {
  if (draft.templateMode !== 'manual') {
    return false;
  }

  switch (field) {
    case 'complianceStatement':
      return draft.complianceStatement !== objectDefaults.defaultComplianceStatement;
    case 'objectName':
      return draft.objectName !== objectDefaults.objectName;
    case 'projectDocumentation':
      return draft.projectDocumentation !== objectDefaults.defaultProjectDocumentation;
  }
}

function resolveLinkedTemplateFields({
  counterpartyLibrary = [],
  objectDefaults,
  signatoryLibrary = [],
}: Omit<ResolveDemoAosrTemplateFieldsInput, 'draft'>): DemoAosrTemplateFields {
  const objectTemplate = getObjectTemplateFromDefaults(objectDefaults);
  const headerOrganizations = objectTemplate.counterparties.map((counterparty) =>
    resolveCounterpartyFromTemplate(counterparty, objectDefaults, counterpartyLibrary),
  );
  const resolvedRepresentatives = resolveRepresentativesFromTemplate(
    objectTemplate,
    objectDefaults,
    signatoryLibrary,
  );

  return {
    complianceStatement: objectTemplate.complianceText,
    copiesLine: objectTemplate.copiesLine,
    headerOrganizations,
    objectName: objectTemplate.objectName,
    objectNameSubscript: objectTemplate.objectNameSubscript,
    projectDocumentation: objectTemplate.projectDocumentation,
    representativeGroups: resolvedRepresentatives.groups,
    representatives: resolvedRepresentatives.representatives,
  };
}

function resolveCounterpartyFromTemplate(
  counterparty: ObjectTemplate['counterparties'][number],
  objectDefaults: DemoAosrObjectDefaults,
  counterpartyLibrary: readonly CounterpartyLibraryItem[],
): DemoAosrHeaderOrganization {
  const libraryItem = counterpartyLibrary.find(({ id }) => id === counterparty.counterpartyId);
  const fallback = objectDefaults.headerOrganizations.find(
    (headerOrganization) =>
      headerOrganization.id === counterparty.id ||
      headerOrganization.globalOrganizationId === counterparty.counterpartyId,
  );
  const subscript =
    counterparty.subscriptMode === 'custom'
      ? counterparty.customSubscript
      : libraryItem?.defaultSubscript;
  const displayName = libraryItem?.displayName ?? fallback?.organizationName ?? '';
  const displayText =
    libraryItem?.fullText ?? (fallback === undefined ? '' : getHeaderDisplayText(fallback));

  return {
    details:
      libraryItem === undefined
        ? (fallback?.details ?? '')
        : removeLeadingDisplayName(libraryItem.fullText, displayName),
    displayText,
    globalOrganizationId: counterparty.counterpartyId,
    id: counterparty.id,
    label: counterparty.title,
    organizationName: displayName,
    ...(subscript === undefined ? {} : { caption: subscript }),
  };
}

function resolveRepresentativesFromTemplate(
  objectTemplate: ObjectTemplate,
  objectDefaults: DemoAosrObjectDefaults,
  signatoryLibrary: readonly SignatoryLibraryItem[],
): {
  readonly groups: AosrPrintState['representatives']['groups'];
  readonly representatives: readonly DemoAosrRepresentative[];
} {
  const representatives: DemoAosrRepresentative[] = [];
  const groups = objectTemplate.representativeGroups.map((group) => ({
    members: group.members.map((member) => {
      const libraryItem = signatoryLibrary.find(({ id }) => id === member.signatoryId);
      const fallback = objectDefaults.representativeLibrary.find(
        (representative) =>
          representative.id === member.signatoryId ||
          representative.globalRepresentativeId === member.signatoryId,
      );
      const subscript =
        member.subscriptMode === 'custom'
          ? (member.customSubscript ?? '')
          : (libraryItem?.defaultSubscript ?? fallback?.details ?? '');
      const representative = getRepresentativeFromTemplateMember(
        group,
        member,
        libraryItem,
        fallback,
        subscript,
      );

      representatives.push(representative);

      return {
        introDisplayText: representative.introDisplayText ?? '',
        signatureName: representative.signatureName ?? representative.fullName,
        signatureText: representative.signatureText ?? '',
        subscript,
      };
    }),
    title: group.title,
  }));

  return { groups, representatives };
}

function getRepresentativeFromTemplateMember(
  group: ObjectTemplate['representativeGroups'][number],
  member: ObjectTemplate['representativeGroups'][number]['members'][number],
  libraryItem: SignatoryLibraryItem | undefined,
  fallback: DemoAosrRepresentative | undefined,
  subscript: string,
): DemoAosrRepresentative {
  const fullName = libraryItem?.fullName ?? fallback?.fullName ?? '';
  const position = libraryItem?.position ?? fallback?.position ?? '';
  const organization = libraryItem?.organization ?? fallback?.organization ?? '';
  const authorityBasis = libraryItem?.authorityDocument ?? fallback?.authorityBasis ?? '';
  const nrsId = libraryItem?.nrsId ?? fallback?.nrsId;
  const signatureText =
    libraryItem?.signatureText ??
    [position, organization]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' ');
  const signatureName = libraryItem?.signatureName ?? fullName;
  const introDisplayText =
    libraryItem?.introDisplayText ??
    [signatureText, fullName, authorityBasis, nrsId === undefined ? '' : `НРС ${nrsId}`]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(', ');

  return {
    authorityBasis,
    fullName,
    globalRepresentativeId: member.signatoryId,
    id: member.id,
    introDisplayText,
    organization,
    position,
    roleLabel: group.title,
    signatureName,
    signatureText,
    templateGroupId: group.id,
    ...(subscript === '' ? {} : { details: subscript }),
    ...(nrsId === undefined ? {} : { nrsId }),
  };
}

function getHeaderDisplayText(headerOrganization: DemoAosrHeaderOrganization): string {
  if (headerOrganization.displayText !== undefined) {
    return headerOrganization.displayText;
  }

  return [headerOrganization.organizationName, headerOrganization.details]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(' ');
}

function removeLeadingDisplayName(fullText: string, displayName: string): string {
  const normalizedFullText = fullText.trim();
  const normalizedDisplayName = displayName.trim();

  if (
    normalizedDisplayName !== '' &&
    normalizedFullText
      .toLocaleLowerCase('ru-RU')
      .startsWith(normalizedDisplayName.toLocaleLowerCase('ru-RU'))
  ) {
    return normalizedFullText.slice(normalizedDisplayName.length).trim();
  }

  return normalizedFullText;
}

function createManualTemplateSnapshot(
  templateFields: DemoAosrTemplateFields,
): DemoAosrManualTemplateSnapshot {
  return {
    counterparties: templateFields.headerOrganizations.map((headerOrganization) => ({
      displayText: getHeaderDisplayText(headerOrganization),
      subscript: headerOrganization.caption ?? '',
      title: headerOrganization.label,
    })),
    documentTemplateDefaults: {
      copiesLine: templateFields.copiesLine,
    },
    object: {
      name: templateFields.objectName,
      nameSubscript: templateFields.objectNameSubscript,
    },
    project: {
      compliance: templateFields.complianceStatement,
      documentation: templateFields.projectDocumentation,
    },
    representatives: {
      groups: templateFields.representativeGroups,
    },
  };
}

function syncManualTemplateSnapshotFromDraft(draft: DemoAosrDraft): DemoAosrDraft {
  if (draft.templateMode !== 'manual') {
    return draft;
  }

  return {
    ...draft,
    manualTemplateSnapshot: createManualTemplateSnapshot({
      complianceStatement: draft.complianceStatement,
      copiesLine: draft.copiesCount,
      headerOrganizations: draft.headerOrganizations,
      objectName: draft.objectName,
      objectNameSubscript: draft.manualTemplateSnapshot?.object.nameSubscript ?? '',
      projectDocumentation: draft.projectDocumentation,
      representativeGroups: buildRepresentativePrintGroups(draft.representatives),
      representatives: draft.representatives,
    }),
  };
}

function getRepresentativeSignatureText(representative: DemoAosrRepresentative): string {
  if (representative.signatureText !== undefined) {
    return representative.signatureText;
  }

  return [representative.position, representative.organization]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(' ');
}

function getRepresentativeIntroDisplayText(representative: DemoAosrRepresentative): string {
  if (representative.introDisplayText !== undefined) {
    return representative.introDisplayText;
  }

  return [
    getRepresentativeSignatureText(representative),
    representative.fullName,
    representative.authorityBasis,
    representative.nrsId === undefined ? '' : `НРС ${representative.nrsId}`,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(', ');
}

function buildRepresentativePrintGroups(
  representatives: readonly DemoAosrRepresentative[],
): AosrPrintState['representatives']['groups'] {
  const groups: {
    id: string;
    title: string;
    members: AosrPrintState['representatives']['groups'][number]['members'][number][];
  }[] = [];

  for (const representative of representatives) {
    const introDisplayText = getRepresentativeIntroDisplayText(representative);
    const rawSubscript = representative.details?.trim() ?? '';
    const subscript =
      normalizeRepresentativeText(rawSubscript) === normalizeRepresentativeText(introDisplayText)
        ? ''
        : rawSubscript;
    const member = {
      introDisplayText,
      signatureName: representative.signatureName ?? representative.fullName,
      signatureText: getRepresentativeSignatureText(representative),
      subscript,
    };
    const groupId = representative.templateGroupId ?? `manual-group-${representative.id}`;
    const existingGroup = groups.find(({ id }) => id === groupId);

    if (existingGroup === undefined) {
      groups.push({ id: groupId, members: [member], title: representative.roleLabel });
    } else {
      existingGroup.members.push(member);
    }
  }

  return groups.map(({ members, title }) => ({ members, title }));
}

function normalizeRepresentativeText(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

export function getDraftComplianceStatement(draft: DemoAosrDraft): string {
  return draft.complianceStatement;
}

export function isDraftComplianceFromObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): boolean {
  return draft.complianceStatement === objectDefaults.defaultComplianceStatement;
}

export function updateDraftComplianceStatement(draft: DemoAosrDraft, value: string): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    complianceStatement: value,
  });
}

export function resetDraftComplianceToObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    complianceStatement: objectDefaults.defaultComplianceStatement,
  });
}

export function isDraftObjectNameFromObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): boolean {
  return draft.objectName === objectDefaults.objectName;
}

export function resetDraftObjectNameToObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    objectName: objectDefaults.objectName,
  });
}

export function isDraftProjectDocumentationFromObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): boolean {
  return draft.projectDocumentation === objectDefaults.defaultProjectDocumentation;
}

export function resetDraftProjectDocumentationToObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    projectDocumentation: objectDefaults.defaultProjectDocumentation,
  });
}

export function isDraftHeaderOrganizationsFromObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): boolean {
  return areHeaderOrganizationsEqual(draft.headerOrganizations, objectDefaults.headerOrganizations);
}

export function resetDraftHeaderOrganizationsToObjectDefault(
  draft: DemoAosrDraft,
  objectDefaults: DemoAosrObjectDefaults,
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    headerOrganizations: copyHeaderOrganizations(objectDefaults.headerOrganizations),
  });
}

export function moveHeaderOrganizationInDraft(
  draft: DemoAosrDraft,
  headerOrganizationId: string,
  direction: 'up' | 'down',
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    headerOrganizations: moveItemById(draft.headerOrganizations, headerOrganizationId, direction),
  });
}

export function updateHeaderOrganizationInDraft(
  draft: DemoAosrDraft,
  headerOrganizationId: string,
  field: 'caption' | 'details' | 'label' | 'organizationName',
  value: string,
): DemoAosrDraft {
  if (draft.templateMode !== 'manual') {
    return draft;
  }

  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    headerOrganizations: draft.headerOrganizations.map((headerOrganization) => {
      if (headerOrganization.id !== headerOrganizationId) {
        return headerOrganization;
      }

      const { displayText, ...editableHeaderOrganization } = headerOrganization;
      void displayText;

      return { ...editableHeaderOrganization, [field]: value };
    }),
  });
}

export function updateDemoObjectDefaultsField(
  objectDefaults: DemoAosrObjectDefaults,
  field: DemoAosrObjectDefaultsField,
  value: string,
): DemoAosrObjectDefaults {
  const objectTemplate = updateObjectTemplateField(objectDefaults.objectTemplate, field, value);

  return {
    ...objectDefaults,
    [field]: value,
    objectTemplate,
  };
}

function updateObjectTemplateField(
  objectTemplate: ObjectTemplate,
  field: DemoAosrObjectDefaultsField,
  value: string,
): ObjectTemplate {
  switch (field) {
    case 'defaultComplianceStatement':
      return { ...objectTemplate, complianceText: value };
    case 'defaultCopiesLine':
      return { ...objectTemplate, copiesLine: value };
    case 'defaultProjectDocumentation':
      return { ...objectTemplate, projectDocumentation: value };
    case 'objectName':
      return { ...objectTemplate, objectName: value };
    case 'objectNameSubscript':
      return { ...objectTemplate, objectNameSubscript: value };
    case 'projectName':
      return objectTemplate;
  }
}

export function addHeaderOrganizationBlock(
  objectDefaults: DemoAosrObjectDefaults,
  headerOrganization: DemoAosrHeaderOrganization,
): DemoAosrObjectDefaults {
  const counterparty = {
    counterpartyId: headerOrganization.globalOrganizationId ?? headerOrganization.id,
    id: headerOrganization.id,
    subscriptMode:
      headerOrganization.caption === undefined ? ('fromLibrary' as const) : ('custom' as const),
    title: headerOrganization.label,
    ...(headerOrganization.caption === undefined
      ? {}
      : { customSubscript: headerOrganization.caption }),
  };

  return {
    ...objectDefaults,
    headerOrganizations: [...objectDefaults.headerOrganizations, headerOrganization],
    objectTemplate: {
      ...objectDefaults.objectTemplate,
      counterparties: [...objectDefaults.objectTemplate.counterparties, counterparty],
    },
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
    objectTemplate: {
      ...objectDefaults.objectTemplate,
      counterparties: moveItemById(
        objectDefaults.objectTemplate.counterparties,
        headerOrganizationId,
        direction,
      ),
    },
  };
}

export function addRepresentativeToLibrary(
  objectDefaults: DemoAosrObjectDefaults,
  representative: DemoAosrRepresentative,
): DemoAosrObjectDefaults {
  const signatoryId = representative.globalRepresentativeId ?? representative.id;

  if (
    objectDefaults.representativeLibrary.some(
      (existingRepresentative) => existingRepresentative.id === representative.id,
    )
  ) {
    return objectDefaults;
  }

  const existingGroup = objectDefaults.objectTemplate.representativeGroups.find(
    ({ title }) => title === representative.roleLabel,
  );
  const groupId = existingGroup?.id ?? `representative-group-${representative.id}`;
  const member = {
    id: `representative-member-${representative.id}`,
    signatoryId,
    subscriptMode:
      representative.details === undefined ? ('fromLibrary' as const) : ('custom' as const),
    ...(representative.details === undefined ? {} : { customSubscript: representative.details }),
  };
  const representativeGroups =
    existingGroup === undefined
      ? [
          ...objectDefaults.objectTemplate.representativeGroups,
          { id: groupId, members: [member], title: representative.roleLabel },
        ]
      : objectDefaults.objectTemplate.representativeGroups.map((group) =>
          group.id === existingGroup.id ? { ...group, members: [...group.members, member] } : group,
        );

  return {
    ...objectDefaults,
    objectTemplate: {
      ...objectDefaults.objectTemplate,
      representativeGroups,
    },
    representativeLibrary: [
      ...objectDefaults.representativeLibrary,
      { ...representative, templateGroupId: groupId },
    ],
  };
}

export function addRepresentativeToDraft(
  draft: DemoAosrDraft,
  representative: DemoAosrRepresentative,
): DemoAosrDraft {
  if (draft.representatives.some(({ id }) => id === representative.id)) {
    return draft;
  }

  const manualRepresentative = {
    ...representative,
    templateGroupId: representative.templateGroupId ?? `manual-group-${representative.id}`,
  };

  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    representatives: [...draft.representatives, manualRepresentative],
  });
}

export function removeRepresentativeFromDraft(
  draft: DemoAosrDraft,
  representativeId: string,
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    representatives: draft.representatives.filter(({ id }) => id !== representativeId),
  });
}

export function updateRepresentativeInDraft(
  draft: DemoAosrDraft,
  representativeId: string,
  field:
    | 'authorityBasis'
    | 'details'
    | 'fullName'
    | 'introDisplayText'
    | 'nrsId'
    | 'organization'
    | 'position'
    | 'roleLabel'
    | 'signatureName'
    | 'signatureText',
  value: string,
): DemoAosrDraft {
  if (draft.templateMode !== 'manual') {
    return draft;
  }

  const sourceRepresentative = draft.representatives.find(({ id }) => id === representativeId);

  if (sourceRepresentative === undefined) {
    return draft;
  }

  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    representatives: draft.representatives.map((representative) => {
      const isSameRepresentative = representative.id === representativeId;
      const isSameGroupTitle =
        field === 'roleLabel' &&
        sourceRepresentative.templateGroupId !== undefined &&
        representative.templateGroupId === sourceRepresentative.templateGroupId;

      if (!isSameRepresentative && !isSameGroupTitle) {
        return representative;
      }

      if (field === 'introDisplayText' || field === 'signatureName' || field === 'signatureText') {
        return { ...representative, [field]: value };
      }

      const { introDisplayText, signatureName, signatureText, ...editableRepresentative } =
        representative;
      void introDisplayText;
      void signatureName;
      void signatureText;

      return { ...editableRepresentative, [field]: value };
    }),
  });
}

export function updateManualObjectNameSubscript(
  draft: DemoAosrDraft,
  value: string,
): DemoAosrDraft {
  if (draft.templateMode !== 'manual' || draft.manualTemplateSnapshot === undefined) {
    return draft;
  }

  return {
    ...draft,
    manualTemplateSnapshot: {
      ...draft.manualTemplateSnapshot,
      object: {
        ...draft.manualTemplateSnapshot.object,
        nameSubscript: value,
      },
    },
  };
}

export function moveRepresentativeInDraft(
  draft: DemoAosrDraft,
  representativeId: string,
  direction: 'up' | 'down',
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    representatives: moveItemById(draft.representatives, representativeId, direction),
  });
}

export function reorderDraftRepresentatives(
  draft: DemoAosrDraft,
  representativeId: string,
  targetRepresentativeId: string,
): DemoAosrDraft {
  return syncManualTemplateSnapshotFromDraft({
    ...draft,
    representatives: moveItemBefore(
      draft.representatives,
      representativeId,
      targetRepresentativeId,
    ),
  });
}

export function addMaterialCertificateToDraft(
  draft: DemoAosrDraft,
  certificate: DemoMaterialCertificate,
): DemoAosrDraft {
  const certificateId = certificate.id;

  if (draft.materialCertificateIds.includes(certificateId)) {
    return draft;
  }

  return {
    ...draft,
    materialCertificateIds: [...draft.materialCertificateIds, certificateId],
    materialCertificateSnapshots: [...draft.materialCertificateSnapshots, { ...certificate }],
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
    materialCertificateSnapshots: draft.materialCertificateSnapshots.filter(
      ({ id }) => id !== certificateId,
    ),
  };
}

export function addObjectDocumentToDraft(
  draft: DemoAosrDraft,
  document: DemoObjectDocument,
): DemoAosrDraft {
  const documentId = document.id;

  if (draft.objectDocumentIds.includes(documentId)) {
    return draft;
  }

  return {
    ...draft,
    objectDocumentIds: [...draft.objectDocumentIds, documentId],
    objectDocumentSnapshots: [...draft.objectDocumentSnapshots, { ...document }],
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
    objectDocumentSnapshots: draft.objectDocumentSnapshots.filter(({ id }) => id !== documentId),
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
    const certificate =
      draft.materialCertificateSnapshots.find(({ id }) => id === certificateId) ??
      certificateLibrary.find(({ id }) => id === certificateId);

    return certificate === undefined ? [] : [certificate];
  });
}

export function getDraftObjectDocuments(
  draft: DemoAosrDraft,
  objectDocumentLibrary: readonly DemoObjectDocument[],
): readonly DemoObjectDocument[] {
  return draft.objectDocumentIds.flatMap((documentId) => {
    const document =
      draft.objectDocumentSnapshots.find(({ id }) => id === documentId) ??
      objectDocumentLibrary.find(({ id }) => id === documentId);

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

function areHeaderOrganizationsEqual(
  left: readonly DemoAosrHeaderOrganization[],
  right: readonly DemoAosrHeaderOrganization[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((leftOrganization, index) => {
    const rightOrganization = right[index];

    return (
      leftOrganization.id === rightOrganization?.id &&
      leftOrganization.globalOrganizationId === rightOrganization.globalOrganizationId &&
      leftOrganization.label === rightOrganization.label &&
      leftOrganization.organizationName === rightOrganization.organizationName &&
      leftOrganization.details === rightOrganization.details &&
      leftOrganization.caption === rightOrganization.caption
    );
  });
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
