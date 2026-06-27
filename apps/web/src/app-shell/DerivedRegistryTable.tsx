import type React from 'react';

import type { DerivedRegistryModel } from './object-registry-model.js';

interface DerivedRegistryTableProps {
  readonly registry: DerivedRegistryModel;
}

export function DerivedRegistryTable({ registry }: DerivedRegistryTableProps): React.JSX.Element {
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
            <th scope="col">№</th>
            <th scope="col">Код</th>
            <th scope="col">Тип документа</th>
            <th scope="col">Номер</th>
            <th scope="col">Дата</th>
            <th scope="col">Папка</th>
            <th scope="col">Документ / работы</th>
          </tr>
        </thead>
        <tbody>
          {registry.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.rowNumber}</td>
              <td>{row.documentTypeCode}</td>
              <td>
                <strong>{row.documentTypeTitle}</strong>
              </td>
              <td>{formatRegistryCell(row.documentNumber)}</td>
              <td>{formatRegistryCell(row.documentDate)}</td>
              <td>{row.folderName}</td>
              <td>{formatRegistryCell(row.workDescription)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatRegistryCell(value: string): string {
  const trimmedValue = value.trim();

  return trimmedValue === '' ? '—' : trimmedValue;
}
