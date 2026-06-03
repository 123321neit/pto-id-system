import type { DemoAosrDraft, DemoMaterialCertificate } from './demo-aosr-workspace.js';

interface DemoMaterialsSelectorProps {
  readonly certificateLibrary: readonly DemoMaterialCertificate[];
  readonly isCertificateLibraryOpen: boolean;
  readonly materialSearch: string;
  readonly selectedDraft: DemoAosrDraft;
  readonly selectedMaterials: readonly DemoMaterialCertificate[];
  readonly onAddMaterialToAct: (certificateId: string) => void;
  readonly onChangeMaterialSearch: (value: string) => void;
  readonly onRemoveMaterialFromAct: (certificateId: string) => void;
  readonly onToggleCertificateLibrary: () => void;
}

export function DemoMaterialsSelector({
  certificateLibrary,
  isCertificateLibraryOpen,
  materialSearch,
  selectedDraft,
  selectedMaterials,
  onAddMaterialToAct,
  onChangeMaterialSearch,
  onRemoveMaterialFromAct,
  onToggleCertificateLibrary,
}: DemoMaterialsSelectorProps): React.JSX.Element {
  const filteredCertificates = filterCertificates(certificateLibrary, materialSearch);

  return (
    <section className="form-section" aria-labelledby="materials-data-title">
      <div className="scope-heading scope-heading--with-action">
        <span>
          <h3 id="materials-data-title">Материалы из библиотеки сертификатов</h3>
          <p className="placeholder-note">
            Материал нельзя вводить вручную: выберите его из библиотеки, чтобы сертификат попал в
            акт и приложения.
          </p>
        </span>
        <button className="compact-toggle" onClick={onToggleCertificateLibrary} type="button">
          {isCertificateLibraryOpen ? 'Скрыть библиотеку' : 'Библиотека сертификатов'}
        </button>
      </div>

      <div className="selected-list" aria-labelledby="selected-materials-title">
        <h4 id="selected-materials-title">Материалы в текущем акте</h4>
        {selectedMaterials.length > 0 ? (
          <ul aria-label="Выбранные материалы текущего акта">
            {selectedMaterials.map((certificate) => (
              <li key={certificate.id}>
                <span>
                  <strong>{certificate.materialName}</strong>
                  <small>
                    {certificate.certificateNumber} / {certificate.documentName}
                  </small>
                </span>
                <button
                  aria-label={`Убрать материал ${certificate.materialName}`}
                  onClick={() => {
                    onRemoveMaterialFromAct(certificate.id);
                  }}
                  type="button"
                >
                  Убрать
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Материалы для текущего акта пока не выбраны.</p>
        )}
      </div>

      {isCertificateLibraryOpen ? (
        <div className="library-panel">
          <label className="search-field">
            Найти материал в библиотеке сертификатов
            <input
              onChange={(event) => {
                onChangeMaterialSearch(event.currentTarget.value);
              }}
              placeholder="Материал, номер сертификата или название документа"
              value={materialSearch}
            />
          </label>

          <div
            className="library-list library-list--compact"
            role="list"
            aria-label="Библиотека сертификатов"
          >
            {filteredCertificates.map((certificate) => {
              const isSelected = selectedDraft.materialCertificateIds.includes(certificate.id);

              return (
                <div className="library-row" key={certificate.id} role="listitem">
                  <span>
                    <strong>{certificate.materialName}</strong>
                    <small>{certificate.certificateNumber}</small>
                    <small>{certificate.documentName}</small>
                  </span>
                  <button
                    disabled={isSelected}
                    onClick={() => {
                      onAddMaterialToAct(certificate.id);
                    }}
                    type="button"
                  >
                    {isSelected ? 'Выбрано' : 'Добавить'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function filterCertificates(
  certificates: readonly DemoMaterialCertificate[],
  search: string,
): readonly DemoMaterialCertificate[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

  if (normalizedSearch === '') {
    return certificates;
  }

  return certificates.filter((certificate) =>
    [certificate.materialName, certificate.certificateNumber, certificate.documentName].some(
      (value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSearch),
    ),
  );
}
