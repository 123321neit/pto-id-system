import { useMemo, useState, type SyntheticEvent } from 'react';

import {
  demoAosrWorkspace,
  demoObjectDocumentTypes,
  type DemoAosrDraft,
  type DemoObjectDocument,
  type DemoObjectDocumentType,
} from '../aosr-demo/demo-aosr-workspace.js';
import { type DemoObjectDocumentInput, useDemoStore } from '../demo-store/demo-store.js';

type ObjectDocumentFilter = 'all' | 'schemes' | 'drawings' | 'protocols' | 'journals';

interface ObjectDocumentFilterOption {
  readonly id: ObjectDocumentFilter;
  readonly label: string;
  readonly type?: DemoObjectDocumentType;
}

interface ObjectDocumentSummary {
  readonly drawings: number;
  readonly protocols: number;
  readonly schemes: number;
  readonly total: number;
}

const objectDocumentFilters: readonly ObjectDocumentFilterOption[] = [
  { id: 'all', label: 'Все' },
  { id: 'schemes', label: 'Схемы', type: 'Исполнительная схема' },
  { id: 'drawings', label: 'Чертежи', type: 'Исполнительный чертеж' },
  { id: 'protocols', label: 'Протоколы', type: 'Протокол' },
  { id: 'journals', label: 'Журналы', type: 'Журнал' },
];

const emptyDocumentForm: DemoObjectDocumentInput = {
  documentDate: '',
  reference: '',
  title: '',
  type: 'Исполнительная схема',
};

export function ObjectDocumentsPage(): React.JSX.Element {
  const { addObjectDocument, objectDocuments } = useDemoStore();
  const [activeFilter, setActiveFilter] = useState<ObjectDocumentFilter>('all');
  const [documentForm, setDocumentForm] = useState<DemoObjectDocumentInput>(emptyDocumentForm);
  const usageByDocumentId = useMemo(
    () => getObjectDocumentUsageCounts(demoAosrWorkspace.drafts),
    [],
  );
  const summary = getObjectDocumentSummary(objectDocuments);
  const filteredDocuments = filterObjectDocuments(objectDocuments, activeFilter);
  const isDocumentFormReady =
    documentForm.title.trim() !== '' &&
    documentForm.reference.trim() !== '' &&
    documentForm.documentDate.trim() !== '';

  const updateDocumentForm = (
    field: keyof DemoObjectDocumentInput,
    value: DemoObjectDocumentInput[keyof DemoObjectDocumentInput],
  ): void => {
    setDocumentForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const addDocument = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!isDocumentFormReady) {
      return;
    }

    addObjectDocument(documentForm);
    setDocumentForm(emptyDocumentForm);
  };

  return (
    <section className="object-documents-workspace" aria-labelledby="object-documents-title">
      <header className="object-documents-hero">
        <div>
          <p className="section-kicker">Реестр документов объекта</p>
          <h2 id="object-documents-title">Документы объекта</h2>
          <p>
            Исполнительные схемы, исполнительные чертежи, протоколы, журналы и другие документы
            объекта.
          </p>
        </div>
      </header>

      <dl className="object-documents-summary" aria-label="Сводка документов объекта">
        <SummaryItem label="Всего документов" value={summary.total} />
        <SummaryItem label="Схемы" value={summary.schemes} />
        <SummaryItem label="Чертежи" value={summary.drawings} />
        <SummaryItem label="Протоколы" value={summary.protocols} />
      </dl>

      <section className="object-documents-panel" aria-labelledby="object-documents-list-title">
        <div className="object-documents-panel__header">
          <div>
            <p className="section-kicker">Список</p>
            <h3 id="object-documents-list-title">Документы</h3>
          </div>
          <div className="object-documents-filters" aria-label="Фильтры документов объекта">
            {objectDocumentFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter.id}
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                }}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="object-documents-table-wrap">
          <table className="object-documents-table">
            <thead>
              <tr>
                <th scope="col">Наименование</th>
                <th scope="col">Тип документа</th>
                <th scope="col">Номер</th>
                <th scope="col">Дата</th>
                <th scope="col">Используется в актах</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => {
                const usageCount = usageByDocumentId.get(document.id) ?? 0;

                return (
                  <tr key={document.id}>
                    <td>
                      <strong>{document.title}</strong>
                    </td>
                    <td>{document.type}</td>
                    <td>{document.reference}</td>
                    <td>{document.documentDate}</td>
                    <td>Используется в {usageCount} актах</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="object-documents-panel" aria-labelledby="object-documents-form-title">
        <div className="object-documents-panel__header">
          <div>
            <p className="section-kicker">Новый документ</p>
            <h3 id="object-documents-form-title">Добавление в демо-реестр</h3>
          </div>
        </div>

        <form className="object-document-form" onSubmit={addDocument}>
          <label>
            Наименование
            <input
              onChange={(event) => {
                updateDocumentForm('title', event.currentTarget.value);
              }}
              value={documentForm.title}
            />
          </label>
          <label>
            Тип
            <select
              onChange={(event) => {
                updateDocumentForm('type', toObjectDocumentType(event.currentTarget.value));
              }}
              value={documentForm.type}
            >
              {demoObjectDocumentTypes.map((documentType) => (
                <option key={documentType} value={documentType}>
                  {documentType}
                </option>
              ))}
            </select>
          </label>
          <label>
            Номер
            <input
              onChange={(event) => {
                updateDocumentForm('reference', event.currentTarget.value);
              }}
              value={documentForm.reference}
            />
          </label>
          <label>
            Дата
            <input
              onChange={(event) => {
                updateDocumentForm('documentDate', event.currentTarget.value);
              }}
              type="date"
              value={documentForm.documentDate}
            />
          </label>
          <button
            className="action-button action-button--primary"
            disabled={!isDocumentFormReady}
            type="submit"
          >
            Добавить документ
          </button>
        </form>
      </section>
    </section>
  );
}

interface SummaryItemProps {
  readonly label: string;
  readonly value: number;
}

function SummaryItem({ label, value }: SummaryItemProps): React.JSX.Element {
  return (
    <div aria-label={`${label}: ${String(value)}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function getObjectDocumentSummary(documents: readonly DemoObjectDocument[]): ObjectDocumentSummary {
  return {
    drawings: countDocumentsByType(documents, 'Исполнительный чертеж'),
    protocols: countDocumentsByType(documents, 'Протокол'),
    schemes: countDocumentsByType(documents, 'Исполнительная схема'),
    total: documents.length,
  };
}

function countDocumentsByType(
  documents: readonly DemoObjectDocument[],
  type: DemoObjectDocumentType,
): number {
  return documents.filter((document) => document.type === type).length;
}

function filterObjectDocuments(
  documents: readonly DemoObjectDocument[],
  activeFilter: ObjectDocumentFilter,
): readonly DemoObjectDocument[] {
  const filter = objectDocumentFilters.find((option) => option.id === activeFilter);
  const filterType = filter?.type;

  if (filterType === undefined) {
    return documents;
  }

  return documents.filter((document) => document.type === filterType);
}

function getObjectDocumentUsageCounts(
  drafts: readonly DemoAosrDraft[],
): ReadonlyMap<string, number> {
  const usageByDocumentId = new Map<string, number>();

  for (const draft of drafts) {
    for (const documentId of draft.objectDocumentIds) {
      usageByDocumentId.set(documentId, (usageByDocumentId.get(documentId) ?? 0) + 1);
    }
  }

  return usageByDocumentId;
}

function toObjectDocumentType(value: string): DemoObjectDocumentType {
  if (demoObjectDocumentTypes.includes(value as DemoObjectDocumentType)) {
    return value as DemoObjectDocumentType;
  }

  return 'Другое';
}
