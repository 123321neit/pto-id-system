import type { DemoAosrDraft, DemoObjectDocument } from '../aosr-demo/demo-aosr-workspace.js';
import { getCertificateMaterialNames, type DemoCertificate } from '../demo-store/demo-store.js';

type FinalPackageGroupId = 'registry' | 'acts' | 'certificates' | 'object-documents';

interface FinalPackageSummary {
  readonly acts: number;
  readonly certificates: number;
  readonly objectDocuments: number;
  readonly total: number;
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
  readonly summary: FinalPackageSummary;
}

export function buildFinalPackageModel(
  drafts: readonly DemoAosrDraft[],
  objectDocuments: readonly DemoObjectDocument[],
  certificates: readonly DemoCertificate[],
): FinalPackageModel {
  const actItems = drafts.map((draft) => ({
    date: draft.actDate,
    id: `final-act-${draft.id}`,
    meta: draft.status === 'draft' ? 'Черновик' : 'На проверку',
    number: draft.actNumber,
    title: `Акт освидетельствования скрытых работ. ${draft.workDescription}`,
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

  return {
    groups: [
      { id: 'registry', items: registryItems, title: 'Реестр ИД' },
      { id: 'acts', items: actItems, title: 'Акты' },
      { id: 'certificates', items: certificateItems, title: 'Сертификаты' },
      { id: 'object-documents', items: objectDocumentItems, title: 'Документы объекта' },
    ],
    summary: {
      acts: actItems.length,
      certificates: certificateItems.length,
      objectDocuments: objectDocumentItems.length,
      total:
        registryItems.length +
        actItems.length +
        certificateItems.length +
        objectDocumentItems.length,
    },
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
