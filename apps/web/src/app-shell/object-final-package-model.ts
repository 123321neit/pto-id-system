import { getDemoActTypeById } from '../act-types/act-types.js';
import type { DemoAosrDraft, DemoObjectDocument } from '../aosr-demo/demo-aosr-workspace.js';
import { getCertificateMaterialNames, type DemoCertificate } from '../demo-store/demo-store.js';

type FinalPackageGroupId = 'registry' | 'acts' | 'certificates' | 'object-documents';

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
  readonly title: string;
}

export interface FinalPackageModel {
  readonly groups: readonly FinalPackageGroup[];
  readonly readiness: FinalPackageReadiness;
  readonly summary: FinalPackageSummary;
}

const aosrActType = getDemoActTypeById('aosr');

export function buildFinalPackageModel(
  drafts: readonly DemoAosrDraft[],
  objectDocuments: readonly DemoObjectDocument[],
  certificates: readonly DemoCertificate[],
): FinalPackageModel {
  const actItems = drafts.map((draft) => ({
    date: draft.actDate,
    id: `final-act-${draft.id}`,
    meta: `${aosrActType.code}: ${draft.status === 'draft' ? 'Черновик' : 'На проверку'}`,
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
  const registryItems: readonly FinalPackageItem[] = [
    {
      date: 'Демо',
      id: 'final-registry',
      meta: 'Производный реестр итогового комплекта',
      number: 'Реестр ИД',
      title: 'Итоговый реестр исполнительной документации',
    },
  ];

  const summary: FinalPackageSummary = {
    acts: actItems.length,
    certificates: certificateItems.length,
    objectDocuments: objectDocumentItems.length,
    total:
      registryItems.length + actItems.length + certificateItems.length + objectDocumentItems.length,
  };

  return {
    groups: [
      { id: 'registry', items: registryItems, title: 'Реестр ИД' },
      { id: 'acts', items: actItems, title: 'Акты' },
      { id: 'certificates', items: certificateItems, title: 'Сертификаты' },
      { id: 'object-documents', items: objectDocumentItems, title: 'Документы объекта' },
    ],
    readiness: buildFinalPackageReadiness(summary),
    summary,
  };
}

// Frontend-only package diagnostics. Future versions may validate attached files,
// signatures, document lifecycle statuses and issued/reviewed package states here.
export function buildFinalPackageReadiness(
  summary: Pick<FinalPackageSummary, 'acts' | 'certificates' | 'objectDocuments'>,
): FinalPackageReadiness {
  const issues: string[] = [];

  if (summary.acts === 0) {
    issues.push('Нет актов');
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
    statusLabel: status === 'ready' ? '🟢 Готов к выпуску' : '🟡 Требует заполнения',
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
