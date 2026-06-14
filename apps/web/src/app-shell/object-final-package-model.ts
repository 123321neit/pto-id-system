import { getDemoActTypeById } from '../act-types/act-types.js';
import type { DemoAosrDraft, DemoObjectDocument } from '../aosr-demo/demo-aosr-workspace.js';
import { getCertificateMaterialNames, type DemoCertificate } from '../demo-store/demo-store.js';
import {
  demoObjectPeriods,
  getDemoObjectPeriodDrafts,
  type DemoObjectPeriod,
  type DemoObjectPeriods,
} from './object-periods.js';
import {
  buildFinalRegistryModel,
  buildPeriodRegistryModel,
  type DerivedRegistryModel,
} from './object-registry-model.js';

type FinalPackageGroupId = 'registry' | 'acts' | 'certificates' | 'object-documents';

export type IdPackageType = 'periodic' | 'final';

export interface IdPackageCompositionSummary {
  readonly acts: number;
  readonly objectDocuments: number;
  readonly usedCertificates: number;
}

export interface PeriodicIdPackageModel {
  readonly id: string;
  readonly note: string;
  readonly periodName: string;
  readonly summary: IdPackageCompositionSummary;
  readonly title: string;
  readonly type: 'periodic';
}

export interface FinalIdPackageOverviewModel {
  readonly description: string;
  readonly id: string;
  readonly summary: IdPackageCompositionSummary;
  readonly title: string;
  readonly type: 'final';
}

export interface IdPackageOverviewModel {
  readonly finalPackage: FinalIdPackageOverviewModel;
  readonly periodicPackages: readonly PeriodicIdPackageModel[];
}

interface FinalPackageSummary {
  readonly acts: number;
  readonly certificates: number;
  readonly objectDocuments: number;
  readonly total: number;
}

export type FinalPackageReadinessStatus = 'ready' | 'needs-attention';

export interface FinalPackageReadiness {
  readonly issues: readonly string[];
  readonly status: FinalPackageReadinessStatus;
  readonly statusLabel: string;
}

interface FinalPackageItem {
  readonly date: string;
  readonly id: string;
  readonly meta: string;
  readonly number: string;
  readonly title: string;
}

export interface FinalPackageGroup {
  readonly id: FinalPackageGroupId;
  readonly items: readonly FinalPackageItem[];
  readonly registry?: DerivedRegistryModel;
  readonly title: string;
}

export interface FinalPackageModel {
  readonly groups: readonly FinalPackageGroup[];
  readonly readiness: FinalPackageReadiness;
  readonly summary: FinalPackageSummary;
}

const aosrActType = getDemoActTypeById('aosr');

export const finalIdPackageDescription =
  'Итоговая ИД — генерируемое представление по текущему состоянию объекта: она собирает все периоды, документы объекта и использованные сертификаты без дублей.';

export const periodicIdPackageDescription =
  'Периодическая ИД — генерируемое представление по текущему состоянию выбранного периода. Если документы меняются, повторное формирование покажет обновленный состав.';

export function buildIdPackageOverviewModel(
  drafts: readonly DemoAosrDraft[],
  objectDocuments: readonly DemoObjectDocument[],
  certificates: readonly DemoCertificate[],
  periods: DemoObjectPeriods = demoObjectPeriods,
): IdPackageOverviewModel {
  const finalPackage = buildFinalPackageModel(drafts, objectDocuments, certificates, periods);

  return {
    finalPackage: {
      description: finalIdPackageDescription,
      id: 'final-object-id-package',
      summary: {
        acts: finalPackage.summary.acts,
        objectDocuments: finalPackage.summary.objectDocuments,
        usedCertificates: finalPackage.summary.certificates,
      },
      title: 'Итоговая ИД по объекту',
      type: 'final',
    },
    periodicPackages: periods.map((period) => {
      const packageDrafts = getDemoObjectPeriodDrafts(period, drafts);

      return {
        id: `periodic-id-${period.id}`,
        note: 'Реестр и периодическая ИД пересобираются из текущих документов периода, без закрытия периода и без архива.',
        periodName: period.name,
        summary: buildIdPackageCompositionSummary(packageDrafts, objectDocuments, certificates),
        title: period.periodicIdTitle,
        type: 'periodic',
      };
    }),
  };
}

export function buildPeriodicPackageModel(
  period: DemoObjectPeriod,
  drafts: readonly DemoAosrDraft[],
  objectDocuments: readonly DemoObjectDocument[],
  certificates: readonly DemoCertificate[],
): FinalPackageModel {
  const periodDrafts = getDemoObjectPeriodDrafts(period, drafts);
  const periodRegistry = buildPeriodRegistryModel(period, drafts);
  const packageModel = buildFinalPackageModel(periodDrafts, objectDocuments, certificates);
  const [, actsGroup, certificatesGroup, objectDocumentsGroup] = packageModel.groups;

  if (
    actsGroup === undefined ||
    certificatesGroup === undefined ||
    objectDocumentsGroup === undefined
  ) {
    throw new Error('Final package model must contain acts, certificates and object documents.');
  }

  return {
    ...packageModel,
    groups: [
      {
        id: 'registry',
        items: [],
        registry: periodRegistry,
        title: 'Реестр периода',
      },
      { ...actsGroup, title: 'Документы периода' },
      certificatesGroup,
      objectDocumentsGroup,
    ],
  };
}

export function buildFinalPackageModel(
  drafts: readonly DemoAosrDraft[],
  objectDocuments: readonly DemoObjectDocument[],
  certificates: readonly DemoCertificate[],
  periods: DemoObjectPeriods = demoObjectPeriods,
): FinalPackageModel {
  const finalRegistry = buildFinalRegistryModel(drafts, periods);
  const actItems = drafts.map((draft) => ({
    date: draft.actDate,
    id: `final-act-${draft.id}`,
    meta: `${aosrActType.code}: версия документа v1.0`,
    number: draft.actNumber,
    title: `${aosrActType.title}. ${draft.workDescription}`,
  }));
  const certificateItems = getUniqueCertificatesUsedInDrafts(drafts, certificates).map(
    (certificate) => ({
      date: certificate.issuedAt,
      id: `final-certificate-${certificate.id}`,
      meta: getCertificateMaterialNames(certificate).join('; '),
      number: certificate.documentNumber,
      title: certificate.documentType,
    }),
  );
  const objectDocumentItems = getUniqueObjectDocumentsUsedInDrafts(drafts, objectDocuments).map(
    (document) => ({
      date: document.documentDate,
      id: `final-object-document-${document.id}`,
      meta: document.type,
      number: document.reference,
      title: document.title,
    }),
  );
  const summary: FinalPackageSummary = {
    acts: actItems.length,
    certificates: certificateItems.length,
    objectDocuments: objectDocumentItems.length,
    total: 1 + actItems.length + certificateItems.length + objectDocumentItems.length,
  };

  return {
    groups: [
      { id: 'registry', items: [], registry: finalRegistry, title: finalRegistry.title },
      { id: 'acts', items: actItems, title: 'Документы из периодов' },
      { id: 'certificates', items: certificateItems, title: 'Сертификаты' },
      { id: 'object-documents', items: objectDocumentItems, title: 'Документы объекта' },
    ],
    readiness: buildFinalPackageReadiness(summary),
    summary,
  };
}

// Frontend-only package diagnostics. Future versions may check attached files and
// empty package sections here without blocking print output.
export function buildFinalPackageReadiness(
  summary: Pick<FinalPackageSummary, 'acts' | 'certificates' | 'objectDocuments'>,
): FinalPackageReadiness {
  const issues: string[] = [];

  if (summary.acts === 0) {
    issues.push('Нет документов периода');
  }

  if (summary.certificates === 0) {
    issues.push('Нет сертификатов');
  }

  if (summary.objectDocuments === 0) {
    issues.push('Нет документов объекта');
  }

  const status: FinalPackageReadinessStatus = issues.length === 0 ? 'ready' : 'needs-attention';

  return {
    issues,
    status,
    statusLabel: status === 'ready' ? '🟢 Поля заполнены' : '🟡 Есть пустые разделы',
  };
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

      if (certificate !== undefined && !usedCertificates.has(certificate.id)) {
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
    for (const documentId of draft.objectDocumentIds) {
      const document = objectDocumentById.get(documentId);

      if (document !== undefined && !usedObjectDocuments.has(document.id)) {
        usedObjectDocuments.set(document.id, document);
      }
    }
  }

  return [...usedObjectDocuments.values()];
}

function buildIdPackageCompositionSummary(
  drafts: readonly DemoAosrDraft[],
  objectDocuments: readonly DemoObjectDocument[],
  certificates: readonly DemoCertificate[],
): IdPackageCompositionSummary {
  return {
    acts: drafts.length,
    objectDocuments: getUniqueObjectDocumentsUsedInDrafts(drafts, objectDocuments).length,
    usedCertificates: getUniqueCertificatesUsedInDrafts(drafts, certificates).length,
  };
}
