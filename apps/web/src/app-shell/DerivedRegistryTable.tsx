import type React from 'react';

import type { DerivedRegistryModel } from './object-registry-model.js';

interface DerivedRegistryTableProps {
  readonly registry: DerivedRegistryModel;
}

export function DerivedRegistryTable({ registry }: DerivedRegistryTableProps): React.JSX.Element {
  const shouldShowFolderColumn = registry.scope === 'final';

  if (registry.rows.length === 0) {
    return (
      <p className="derived-registry-empty">
        В этой папке пока нет документов для производного реестра.
      </p>
    );
  }

  return (
    <div className="object-documents-table-wrap derived-registry-table-wrap">
      <table className="object-documents-table derived-registry-table">
        <thead>
          <tr>
            <th scope="col">№ п/п</th>
            <th scope="col">Обозначение / номер</th>
            <th scope="col">Наименование документа</th>
            <th scope="col">Дата</th>
            <th scope="col">Примечание / статус</th>
            {shouldShowFolderColumn ? <th scope="col">Папка</th> : null}
          </tr>
        </thead>
        <tbody>
          {registry.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.rowNumber}</td>
              <td>
                <strong>{row.documentNumberDisplay}</strong>
              </td>
              <td>{row.documentName}</td>
              <td>{row.documentDateDisplay}</td>
              <td>{row.statusText}</td>
              {shouldShowFolderColumn ? <td>{row.folderName}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
