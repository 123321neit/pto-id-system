import { useState, type ReactNode } from 'react';

import {
  DemoStoreContext,
  initialDemoCertificates,
  initialDemoObjectDocuments,
  initialDemoOrganizations,
  initialDemoRepresentatives,
  type DemoCertificate,
  type DemoCertificateInput,
  type DemoObjectDocumentInput,
  type DemoOrganization,
  type DemoOrganizationInput,
  type DemoRepresentative,
  type DemoRepresentativeInput,
} from './demo-store.js';
import type { DemoObjectDocument } from '../aosr-demo/demo-aosr-workspace.js';

interface DemoStoreProviderProps {
  readonly children: ReactNode;
}

export function DemoStoreProvider({ children }: DemoStoreProviderProps): React.JSX.Element {
  const [certificates, setCertificates] =
    useState<readonly DemoCertificate[]>(initialDemoCertificates);
  const [objectDocuments, setObjectDocuments] = useState<readonly DemoObjectDocument[]>(
    initialDemoObjectDocuments,
  );
  const [organizations, setOrganizations] =
    useState<readonly DemoOrganization[]>(initialDemoOrganizations);
  const [representatives, setRepresentatives] = useState<readonly DemoRepresentative[]>(
    initialDemoRepresentatives,
  );
  const [createdCertificateCount, setCreatedCertificateCount] = useState(1);
  const [createdObjectDocumentCount, setCreatedObjectDocumentCount] = useState(1);
  const [createdOrganizationCount, setCreatedOrganizationCount] = useState(1);
  const [createdRepresentativeCount, setCreatedRepresentativeCount] = useState(1);

  const addCertificate = (input: DemoCertificateInput): void => {
    const createdId = `global-certificate-created-${String(createdCertificateCount)}`;
    const certificate: DemoCertificate = {
      documentNumber: input.documentNumber.trim(),
      documentType: input.documentType.trim(),
      id: createdId,
      issuedAt: input.issuedAt.trim(),
      issuer: input.issuer.trim(),
      manufacturer: input.manufacturer.trim(),
      materials: [
        {
          id: `${createdId}-material-1`,
          name: input.materialName.trim(),
        },
      ],
      status: input.status,
      validUntil: input.validUntil.trim(),
    };

    setCertificates((currentCertificates) => [certificate, ...currentCertificates]);
    setCreatedCertificateCount((currentCount) => currentCount + 1);
  };

  const addObjectDocument = (input: DemoObjectDocumentInput): void => {
    const document: DemoObjectDocument = {
      documentDate: input.documentDate.trim(),
      id: `object-document-created-${String(createdObjectDocumentCount)}`,
      reference: input.reference.trim(),
      title: input.title.trim(),
      type: input.type,
    };

    setObjectDocuments((currentDocuments) => [document, ...currentDocuments]);
    setCreatedObjectDocumentCount((currentCount) => currentCount + 1);
  };

  const addOrganization = (input: DemoOrganizationInput): DemoOrganization => {
    const organization: DemoOrganization = {
      caption: 'Пользовательская организация из единого demo store.',
      details: input.details.trim(),
      id: `global-organization-created-${String(createdOrganizationCount)}`,
      name: input.name.trim(),
      usageNote: input.usageNote.trim(),
    };

    setOrganizations((currentOrganizations) => [...currentOrganizations, organization]);
    setCreatedOrganizationCount((currentCount) => currentCount + 1);

    return organization;
  };

  const addRepresentative = (input: DemoRepresentativeInput): DemoRepresentative => {
    const nrsDetails = input.nrsDetails.trim();
    const representative: DemoRepresentative = {
      authorityBasis: input.authorityBasis.trim(),
      fullName: input.fullName.trim(),
      id: `representative-created-${String(createdRepresentativeCount)}`,
      organization: input.organization.trim(),
      position: input.position.trim(),
      roleLabel: input.roleLabel.trim(),
      ...(nrsDetails === '' ? {} : { nrsDetails }),
    };

    setRepresentatives((currentRepresentatives) => [...currentRepresentatives, representative]);
    setCreatedRepresentativeCount((currentCount) => currentCount + 1);

    return representative;
  };

  const updateOrganization = (
    organizationId: string,
    field: 'details' | 'name',
    value: string,
  ): void => {
    setOrganizations((currentOrganizations) =>
      currentOrganizations.map((organization) =>
        organization.id === organizationId ? { ...organization, [field]: value } : organization,
      ),
    );
  };

  const updateRepresentative = (
    representativeId: string,
    field: 'authorityBasis' | 'fullName' | 'nrsDetails' | 'organization' | 'position',
    value: string,
  ): void => {
    setRepresentatives((currentRepresentatives) =>
      currentRepresentatives.map((representative) =>
        representative.id === representativeId
          ? { ...representative, [field]: value }
          : representative,
      ),
    );
  };

  return (
    <DemoStoreContext.Provider
      value={{
        addCertificate,
        addObjectDocument,
        addOrganization,
        addRepresentative,
        certificates,
        objectDocuments,
        organizations,
        representatives,
        updateOrganization,
        updateRepresentative,
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}
