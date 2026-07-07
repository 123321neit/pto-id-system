import { getDemoActTypeById } from '../act-types/act-types.js';
import type {
  DemoAosrDraft,
  DemoObjectDocument,
  DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import { getCertificateMaterialNames, type DemoCertificate } from '../demo-store/demo-store.js';
import {
  demoIdFolders,
  getDemoIdFolderDrafts,
  getDemoIdFolderForDraftId,
  type DemoIdFolder,
  type DemoIdFolders,
} from './object-id-folders.js';

export type IdRegisterPrintScope = 'folder' | 'section';

export interface IdRegisterContractorRow {
  readonly authorityDocument: string;
  readonly buildingControlRepresentative: string;
  readonly contactDetails: string;
  readonly id: string;
  readonly licenses: string;
  readonly organizationName: string;
  readonly projectDocumentation: string;
  readonly representative: string;
  readonly workTypes: string;
}

export interface IdRegisterDrawingSetRow {
  readonly id: string;
  readonly organizationName: string;
  readonly projectName: string;
  readonly reference: string;
  readonly sheetCount: string;
}

export interface IdRegisterQualityDocumentRow {
  readonly documentName: string;
  readonly id: string;
  readonly issuerAndValidity: string;
  readonly quantity: string;
  readonly registrationNumber: string;
}

export interface IdRegisterExecutionDocumentRow {
  readonly documentDate: string;
  readonly documentDateDisplay: string;
  readonly documentName: string;
  readonly documentNumber: string;
  readonly documentNumberDisplay: string;
  readonly folderName: string;
  readonly id: string;
  readonly note: string;
}

export interface IdRegisterObjectDocumentRow {
  readonly documentDate: string;
  readonly documentDateDisplay: string;
  readonly documentName: string;
  readonly id: string;
  readonly note: string;
  readonly registrationNumber: string;
}

export interface IdRegisterJournalRow {
  readonly documentName: string;
  readonly id: string;
  readonly note: string;
  readonly registrationNumberAndDate: string;
  readonly responsibleParty: string;
}

export interface IdRegisterPrintState {
  readonly contractors: {
    readonly rows: readonly IdRegisterContractorRow[];
  };
  readonly drawingSets: {
    readonly rows: readonly IdRegisterDrawingSetRow[];
  };
  readonly executionDocuments: {
    readonly rows: readonly IdRegisterExecutionDocumentRow[];
  };
  readonly executiveSchemes: {
    readonly rows: readonly IdRegisterObjectDocumentRow[];
  };
  readonly journals: {
    readonly rows: readonly IdRegisterJournalRow[];
  };
  readonly object: {
    readonly name: string;
  };
  readonly qualityDocuments: {
    readonly rows: readonly IdRegisterQualityDocumentRow[];
  };
  readonly scope: {
    readonly description: string;
    readonly folderName?: string;
    readonly kind: IdRegisterPrintScope;
    readonly title: string;
  };
  readonly work: {
    readonly name: string;
  };
}

export interface BuildFolderIdRegisterPrintStateInput {
  readonly certificates: readonly DemoCertificate[];
  readonly drafts: readonly DemoAosrDraft[];
  readonly folder: DemoIdFolder;
  readonly objectDocuments: readonly DemoObjectDocument[];
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
  readonly workName?: string;
}

export interface BuildSectionIdRegisterPrintStateInput {
  readonly certificates: readonly DemoCertificate[];
  readonly drafts: readonly DemoAosrDraft[];
  readonly folders?: DemoIdFolders;
  readonly objectDocuments: readonly DemoObjectDocument[];
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
  readonly workName?: string;
}

export function buildFolderIdRegisterPrintState({
  certificates,
  drafts,
  folder,
  objectDocuments,
  sectionTemplateSettings,
  workName,
}: BuildFolderIdRegisterPrintStateInput): IdRegisterPrintState {
  return buildIdRegisterPrintState({
    certificates,
    drafts: getDemoIdFolderDrafts(folder, drafts),
    folders: [folder],
    objectDocuments,
    scope: {
      description:
        'Промежуточный реестр собирается из всех задействованных документов выбранной папки без дублирования приложений и библиотечных документов.',
      folderName: folder.name,
      kind: 'folder',
      title: folder.registryTitle,
    },
    sectionTemplateSettings,
    workName,
  });
}

export function buildSectionIdRegisterPrintState({
  certificates,
  drafts,
  folders = demoIdFolders,
  objectDocuments,
  sectionTemplateSettings,
  workName,
}: BuildSectionIdRegisterPrintStateInput): IdRegisterPrintState {
  return buildIdRegisterPrintState({
    certificates,
    drafts,
    folders,
    objectDocuments,
    scope: {
      description:
        'Итоговый реестр собирается из всех задействованных документов всех папок выбранного раздела без дублирования приложений и библиотечных документов.',
      kind: 'section',
      title: 'Итоговый реестр раздела',
    },
    sectionTemplateSettings,
    workName,
  });
}

function buildIdRegisterPrintState({
  certificates,
  drafts,
  folders,
  objectDocuments,
  scope,
  sectionTemplateSettings,
  workName,
}: {
  readonly certificates: readonly DemoCertificate[];
  readonly drafts: readonly DemoAosrDraft[];
  readonly folders: DemoIdFolders;
  readonly objectDocuments: readonly DemoObjectDocument[];
  readonly scope: IdRegisterPrintState['scope'];
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
  readonly workName: string | undefined;
}): IdRegisterPrintState {
  const usedObjectDocuments = getUniqueObjectDocumentsUsedInDrafts(drafts, objectDocuments);
  const projectDrawingSets = buildProjectDrawingSetRows(
    usedObjectDocuments,
    sectionTemplateSettings,
  );

  return {
    contractors: {
      rows: buildContractorRows(sectionTemplateSettings, workName),
    },
    drawingSets: {
      rows: projectDrawingSets,
    },
    executionDocuments: {
      rows: buildExecutionDocumentRows(drafts, folders),
    },
    executiveSchemes: {
      rows: usedObjectDocuments
        .filter(isExecutiveSchemeDocument)
        .map(mapObjectDocumentToRegisterRow),
    },
    journals: {
      rows: usedObjectDocuments.filter(isJournalDocument).map(mapObjectDocumentToJournalRow),
    },
    object: {
      name: sectionTemplateSettings.objectName,
    },
    qualityDocuments: {
      rows: getUniqueCertificatesUsedInDrafts(drafts, certificates).map(
        mapCertificateToQualityDocumentRow,
      ),
    },
    scope,
    work: {
      name: workName ?? sectionTemplateSettings.defaultWorkContractorName,
    },
  };
}

function buildContractorRows(
  sectionTemplateSettings: DemoSectionTemplateSettings,
  workName?: string,
): readonly IdRegisterContractorRow[] {
  const contractorOrganization =
    sectionTemplateSettings.headerOrganizations.find((organization) =>
      normalizeText(organization.label).includes('подряд'),
    ) ?? sectionTemplateSettings.headerOrganizations[0];
  const representative = sectionTemplateSettings.representativeLibrary.find((candidate) =>
    normalizeText(candidate.roleLabel).includes('подряд'),
  );

  if (contractorOrganization === undefined) {
    return [];
  }

  return [
    {
      authorityDocument: representative?.authorityBasis ?? '',
      buildingControlRepresentative: '',
      contactDetails: contractorOrganization.details,
      id: `register-contractor-${contractorOrganization.id}`,
      licenses: '',
      organizationName: contractorOrganization.organizationName,
      projectDocumentation: sectionTemplateSettings.defaultProjectDocumentation,
      representative:
        representative === undefined
          ? ''
          : `${representative.position} ${representative.fullName}, ${representative.authorityBasis}`,
      workTypes: workName ?? sectionTemplateSettings.defaultWorkContractorName,
    },
  ];
}

function buildProjectDrawingSetRows(
  objectDocuments: readonly DemoObjectDocument[],
  sectionTemplateSettings: DemoSectionTemplateSettings,
): readonly IdRegisterDrawingSetRow[] {
  const projectDocuments = objectDocuments.filter(isProjectDrawingSetDocument);

  if (projectDocuments.length > 0) {
    return projectDocuments.map((document) => ({
      id: `register-drawing-set-${document.id}`,
      organizationName: sectionTemplateSettings.defaultWorkContractorName,
      projectName: document.title,
      reference: document.reference,
      sheetCount: '',
    }));
  }

  return [
    {
      id: 'register-drawing-set-section-template',
      organizationName: sectionTemplateSettings.defaultWorkContractorName,
      projectName: sectionTemplateSettings.defaultProjectDocumentation,
      reference: '',
      sheetCount: '',
    },
  ];
}

function buildExecutionDocumentRows(
  drafts: readonly DemoAosrDraft[],
  folders: DemoIdFolders,
): readonly IdRegisterExecutionDocumentRow[] {
  const actType = getDemoActTypeById('aosr');

  return drafts.map((draft) => ({
    documentDate: draft.actDate,
    documentDateDisplay: formatRegisterDate(draft.actDate),
    documentName: `${actType.title}. ${draft.workDescription}`.trim(),
    documentNumber: draft.actNumber,
    documentNumberDisplay: formatRegisterDocumentNumber(draft.actNumber),
    folderName: getDemoIdFolderForDraftId(draft.id, folders).name,
    id: `register-execution-document-${draft.id}`,
    note: '',
  }));
}

function getUniqueCertificatesUsedInDrafts(
  drafts: readonly DemoAosrDraft[],
  certificates: readonly DemoCertificate[],
): readonly DemoCertificate[] {
  const certificateByMaterialId = new Map<string, DemoCertificate>();

  for (const certificate of certificates) {
    for (const material of certificate.materials) {
      certificateByMaterialId.set(material.id, certificate);
    }
  }

  const usedCertificates = new Map<string, DemoCertificate>();

  for (const draft of drafts) {
    for (const materialCertificateId of draft.materialCertificateIds) {
      const certificate = certificateByMaterialId.get(materialCertificateId);

      if (certificate !== undefined) {
        usedCertificates.set(certificate.id, certificate);
      }
    }
  }

  return [...usedCertificates.values()];
}

function getUniqueObjectDocumentsUsedInDrafts(
  drafts: readonly DemoAosrDraft[],
  objectDocuments: readonly DemoObjectDocument[],
): readonly DemoObjectDocument[] {
  const objectDocumentById = new Map(objectDocuments.map((document) => [document.id, document]));
  const usedObjectDocuments = new Map<string, DemoObjectDocument>();

  for (const draft of drafts) {
    for (const objectDocumentId of draft.objectDocumentIds) {
      const document = objectDocumentById.get(objectDocumentId);

      if (document !== undefined) {
        usedObjectDocuments.set(document.id, document);
      }
    }
  }

  return [...usedObjectDocuments.values()];
}

function mapCertificateToQualityDocumentRow(
  certificate: DemoCertificate,
): IdRegisterQualityDocumentRow {
  const materialNames = getCertificateMaterialNames(certificate).join(', ');

  return {
    documentName:
      materialNames === ''
        ? certificate.documentType
        : `${certificate.documentType} (${materialNames})`,
    id: `register-quality-document-${certificate.id}`,
    issuerAndValidity: formatIssuerAndValidity(certificate),
    quantity: '',
    registrationNumber: certificate.documentNumber,
  };
}

function mapObjectDocumentToRegisterRow(document: DemoObjectDocument): IdRegisterObjectDocumentRow {
  return {
    documentDate: document.documentDate,
    documentDateDisplay: formatRegisterDate(document.documentDate),
    documentName: document.title,
    id: `register-object-document-${document.id}`,
    note: '',
    registrationNumber: formatRegisterDocumentNumber(document.reference),
  };
}

function mapObjectDocumentToJournalRow(document: DemoObjectDocument): IdRegisterJournalRow {
  return {
    documentName: document.title,
    id: `register-journal-${document.id}`,
    note: '',
    registrationNumberAndDate: [
      formatRegisterDocumentNumber(document.reference),
      formatRegisterDate(document.documentDate),
    ]
      .filter(Boolean)
      .join(', '),
    responsibleParty: '',
  };
}

function isProjectDrawingSetDocument(document: DemoObjectDocument): boolean {
  const normalizedReference = normalizeText(document.reference);
  const normalizedTitle = normalizeText(document.title);

  return normalizedReference.startsWith('рд') || normalizedTitle.includes('рабочая документация');
}

function isExecutiveSchemeDocument(document: DemoObjectDocument): boolean {
  return document.type === 'Исполнительная схема' || document.type === 'Исполнительный чертеж';
}

function isJournalDocument(document: DemoObjectDocument): boolean {
  return document.type === 'Журнал';
}

function formatIssuerAndValidity(certificate: DemoCertificate): string {
  const parts = [
    certificate.issuer,
    certificate.issuedAt === '' ? '' : `от ${certificate.issuedAt}`,
  ];

  if (certificate.validUntil.trim() !== '') {
    parts.push(`действует до ${certificate.validUntil}`);
  }

  return parts.filter(Boolean).join(', ');
}

function formatRegisterDocumentNumber(value: string): string {
  const trimmedValue = value.trim();

  return trimmedValue === '' || trimmedValue.startsWith('№') ? trimmedValue : `№ ${trimmedValue}`;
}

function formatRegisterDate(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return '';
  }

  const [year, month, day] = trimmedValue.split('-');

  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    !/^\d{4}$/u.test(year) ||
    !/^\d{2}$/u.test(month) ||
    !/^\d{2}$/u.test(day)
  ) {
    return trimmedValue;
  }

  return `${day}.${month}.${year}`;
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU').replace(/\s+/gu, ' ');
}
