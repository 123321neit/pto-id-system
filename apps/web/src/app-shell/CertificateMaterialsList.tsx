import { getCertificateMaterialNames, type DemoCertificate } from '../demo-store/demo-store.js';

interface CertificateMaterialsListProps {
  readonly certificate: DemoCertificate;
}

export function CertificateMaterialsList({
  certificate,
}: CertificateMaterialsListProps): React.JSX.Element {
  return (
    <div className="certificate-materials-list">
      <span className="certificate-materials-list__label">Материалы:</span>
      <ul aria-label={`Материалы сертификата ${certificate.documentNumber}`}>
        {getCertificateMaterialNames(certificate).map((materialName) => (
          <li key={materialName}>{materialName}</li>
        ))}
      </ul>
    </div>
  );
}
