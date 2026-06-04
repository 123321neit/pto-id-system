import type {
  DemoActApplication,
  DemoAosrDraft,
  DemoObjectDocument,
  DemoObjectDocumentType,
} from './demo-aosr-workspace.js';
import { demoObjectDocumentTypes } from './demo-aosr-workspace.js';

interface DemoObjectDocumentsEditorProps {
  readonly allApplications: readonly DemoActApplication[];
  readonly documentSearch: string;
  readonly documentTypeFilter: 'all' | DemoObjectDocumentType;
  readonly finalApplications: readonly DemoActApplication[];
  readonly isObjectDocumentLibraryOpen: boolean;
  readonly objectDocumentLibrary: readonly DemoObjectDocument[];
  readonly selectedDraft: DemoAosrDraft;
  readonly selectedObjectDocuments: readonly DemoObjectDocument[];
  readonly onAddObjectDocumentToAct: (documentId: string) => void;
  readonly onChangeDocumentSearch: (value: string) => void;
  readonly onChangeDocumentTypeFilter: (value: 'all' | DemoObjectDocumentType) => void;
  readonly onRemoveObjectDocumentFromAct: (documentId: string) => void;
  readonly onToggleApplication: (applicationId: string) => void;
  readonly onToggleObjectDocumentLibrary: () => void;
}

export function DemoObjectDocumentsEditor({
  allApplications,
  documentSearch,
  documentTypeFilter,
  finalApplications,
  isObjectDocumentLibraryOpen,
  objectDocumentLibrary,
  selectedDraft,
  selectedObjectDocuments,
  onAddObjectDocumentToAct,
  onChangeDocumentSearch,
  onChangeDocumentTypeFilter,
  onRemoveObjectDocumentFromAct,
  onToggleApplication,
  onToggleObjectDocumentLibrary,
}: DemoObjectDocumentsEditorProps): React.JSX.Element {
  const filteredDocuments = filterObjectDocuments(
    objectDocumentLibrary,
    documentSearch,
    documentTypeFilter,
  );

  return (
    <>
      <section
        className="form-section act-editor-card act-editor-card--featured"
        aria-labelledby="object-documents-data-title"
      >
        <div className="scope-heading scope-heading--with-action">
          <span>
            <p className="section-tag">Пункт 4 акта</p>
            <h3 id="object-documents-data-title">4. Документы объекта</h3>
          </span>
          <button
            aria-expanded={isObjectDocumentLibraryOpen}
            aria-haspopup="dialog"
            className="compact-toggle compact-toggle--accent"
            onClick={onToggleObjectDocumentLibrary}
            type="button"
          >
            Добавить документ
          </button>
        </div>

        <p className="helper-note">
          Выбранный документ появляется в пункте 4 и сразу попадает в приложения. Ниже можно снять
          приложение из итогового перечня, не убирая документ из акта.
        </p>

        <div className="selected-list" aria-labelledby="selected-object-documents-title">
          <h4 id="selected-object-documents-title">Документы в пункте 4</h4>
          {selectedObjectDocuments.length > 0 ? (
            <ul aria-label="Документы пункта 4 текущего акта">
              {selectedObjectDocuments.map((document) => (
                <li key={document.id}>
                  <span>
                    <strong>{document.title}</strong>
                    <small>
                      {document.type} / {document.reference} / {document.documentDate}
                    </small>
                  </span>
                  <button
                    aria-label={`Убрать документ ${document.title}`}
                    onClick={() => {
                      onRemoveObjectDocumentFromAct(document.id);
                    }}
                    type="button"
                  >
                    Убрать
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Документы объекта для пункта 4 пока не выбраны.</p>
          )}
        </div>

        <section className="application-control" aria-labelledby="applications-control-title">
          <div>
            <h4 id="applications-control-title">Приложения</h4>
            <p className="helper-note">
              Все приложения включены по умолчанию. Чекбокс управляет только итоговым перечнем и
              предпросмотром.
            </p>
          </div>

          <div className="application-checklist" role="group" aria-label="Приложения текущего акта">
            {allApplications.length > 0 ? (
              allApplications.map((application) => {
                const isChecked = !selectedDraft.excludedApplicationIds.includes(application.id);

                return (
                  <label className="checkbox-row checkbox-row--application" key={application.id}>
                    <input
                      checked={isChecked}
                      onChange={() => {
                        onToggleApplication(application.id);
                      }}
                      type="checkbox"
                    />
                    <span>
                      <strong>{application.title}</strong>
                      <small>{application.source}</small>
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="empty-state">
                Приложения появятся после выбора материалов и документов.
              </p>
            )}
          </div>

          <div className="selected-list" aria-labelledby="final-applications-title">
            <h4 id="final-applications-title">Итоговые приложения в акте</h4>
            {finalApplications.length > 0 ? (
              <ol aria-label="Итоговые приложения текущего акта">
                {finalApplications.map((application) => (
                  <li key={application.id}>
                    <span>
                      <strong>{application.title}</strong>
                      <small>{application.source}</small>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty-state">
                Ни одно приложение сейчас не включено в итоговый перечень.
              </p>
            )}
          </div>
        </section>
      </section>

      {isObjectDocumentLibraryOpen ? (
        <div className="certificate-picker-overlay">
          <aside
            aria-labelledby="object-document-picker-title"
            aria-modal="true"
            className="certificate-picker-drawer"
            role="dialog"
          >
            <div className="certificate-picker-drawer__header">
              <span>
                <p className="scope-label">Документы</p>
                <h2 id="object-document-picker-title">Документы объекта</h2>
              </span>
              <button
                className="compact-toggle"
                onClick={onToggleObjectDocumentLibrary}
                type="button"
              >
                Закрыть документы
              </button>
            </div>

            <label className="search-field">
              Найти документ объекта
              <input
                autoFocus
                onChange={(event) => {
                  onChangeDocumentSearch(event.currentTarget.value);
                }}
                placeholder="Название, тип, шифр или дата"
                value={documentSearch}
              />
            </label>

            <label className="search-field">
              Тип документа
              <select
                aria-label="Фильтр по типу документа объекта"
                onChange={(event) => {
                  onChangeDocumentTypeFilter(toDocumentTypeFilter(event.currentTarget.value));
                }}
                value={documentTypeFilter}
              >
                <option value="all">Все типы</option>
                {demoObjectDocumentTypes.map((documentType) => (
                  <option key={documentType} value={documentType}>
                    {documentType}
                  </option>
                ))}
              </select>
            </label>

            <div
              className="library-list certificate-picker-drawer__list"
              role="list"
              aria-label="Библиотека документов объекта"
            >
              {filteredDocuments.map((document) => {
                const isSelected = selectedDraft.objectDocumentIds.includes(document.id);

                return (
                  <div
                    className="library-row object-document-row"
                    key={document.id}
                    role="listitem"
                  >
                    <span>
                      <strong>{document.title}</strong>
                      <small>
                        {document.type} / {document.reference}
                      </small>
                      <small>{document.documentDate}</small>
                    </span>
                    <button
                      className={
                        isSelected ? 'action-button' : 'action-button action-button--primary'
                      }
                      disabled={isSelected}
                      onClick={() => {
                        onAddObjectDocumentToAct(document.id);
                      }}
                      type="button"
                    >
                      {isSelected ? 'Документ выбран' : 'Добавить документ'}
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function filterObjectDocuments(
  documents: readonly DemoObjectDocument[],
  search: string,
  typeFilter: 'all' | DemoObjectDocumentType,
): readonly DemoObjectDocument[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

  return documents.filter((document) => {
    const matchesType = typeFilter === 'all' || document.type === typeFilter;
    const matchesSearch =
      normalizedSearch === '' ||
      [document.title, document.type, document.reference, document.documentDate].some((value) =>
        value.toLocaleLowerCase('ru-RU').includes(normalizedSearch),
      );

    return matchesType && matchesSearch;
  });
}

function toDocumentTypeFilter(value: string): 'all' | DemoObjectDocumentType {
  if (value === 'all') {
    return value;
  }

  if (demoObjectDocumentTypes.includes(value as DemoObjectDocumentType)) {
    return value as DemoObjectDocumentType;
  }

  return 'all';
}
