import { useMemo } from 'react';

import { demoAosrWorkspace, type DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import { useDemoStore } from '../demo-store/demo-store.js';
import { DerivedRegistryTable } from './DerivedRegistryTable.js';
import {
  buildSectionFinalPackageModel,
  buildSectionIdPackageOverviewModel,
  buildIntermediateIdPackageModel,
  finalIdPackageDescription,
  intermediateIdPackageDescription,
  type FinalPackageGroup,
  type IntermediateIdPackageModel,
} from './object-final-package-model.js';
import { demoIdFolders, type DemoIdFolder, type DemoIdFolders } from './object-id-folders.js';

interface ObjectFinalPackagePageProps {
  readonly drafts?: readonly DemoAosrDraft[];
  readonly folders?: DemoIdFolders;
  readonly sectionName?: string | undefined;
}

export function ObjectFinalPackagePage({
  drafts = demoAosrWorkspace.drafts,
  folders = demoIdFolders,
  sectionName,
}: ObjectFinalPackagePageProps = {}): React.JSX.Element {
  const { certificates, objectDocuments } = useDemoStore();
  const finalPackage = useMemo(
    () => buildSectionFinalPackageModel(drafts, objectDocuments, certificates, folders),
    [certificates, drafts, objectDocuments, folders],
  );
  const packageOverview = useMemo(
    () => buildSectionIdPackageOverviewModel(drafts, objectDocuments, certificates, folders),
    [certificates, drafts, objectDocuments, folders],
  );
  return (
    <section
      className="object-documents-workspace object-final-package-workspace"
      aria-labelledby="object-final-package-title"
    >
      <header className="object-documents-hero object-final-package-hero">
        <div>
          <p className="section-kicker">Генерируемое представление</p>
          <h2 id="object-final-package-title">
            Итоговая ИД по разделу{sectionName === undefined ? '' : `: ${sectionName}`}
          </h2>
          <p>{finalIdPackageDescription}</p>
        </div>
      </header>

      <FolderPackageOverview packages={packageOverview.intermediatePackages} />

      <dl
        className="object-documents-summary object-documents-summary--quiet"
        aria-label="Сводка итогового комплекта ИД"
      >
        <SummaryItem label="Документы из папок" value={finalPackage.summary.acts} />
        <SummaryItem label="Сертификаты без дублей" value={finalPackage.summary.certificates} />
        <SummaryItem
          label="Документы / чертежи без дублей"
          value={finalPackage.summary.objectDocuments}
        />
        <SummaryItem label="Всего позиций" value={finalPackage.summary.total} />
      </dl>

      <div className="final-package-groups">
        {finalPackage.groups.map((group) => (
          <FinalPackageGroupSection group={group} key={group.id} />
        ))}
      </div>
    </section>
  );
}

interface ObjectIntermediatePackagePageProps {
  readonly drafts?: readonly DemoAosrDraft[];
  readonly folder: DemoIdFolder;
}

export function ObjectIntermediatePackagePage({
  drafts = demoAosrWorkspace.drafts,
  folder,
}: ObjectIntermediatePackagePageProps): React.JSX.Element {
  const { certificates, objectDocuments } = useDemoStore();
  const intermediatePackage = useMemo(
    () => buildIntermediateIdPackageModel(folder, drafts, objectDocuments, certificates),
    [certificates, drafts, objectDocuments, folder],
  );
  return (
    <section
      className="object-documents-workspace object-final-package-workspace"
      aria-labelledby="object-intermediate-package-title"
    >
      <header className="object-documents-hero object-final-package-hero">
        <div>
          <p className="section-kicker">Генерируемое представление</p>
          <h2 id="object-intermediate-package-title">{folder.intermediateIdTitle}</h2>
          <p>{intermediateIdPackageDescription}</p>
        </div>
      </header>

      <dl
        className="object-documents-summary object-documents-summary--quiet"
        aria-label="Сводка промежуточной ИД по папке"
      >
        <SummaryItem label="Документы папки" value={intermediatePackage.summary.acts} />
        <SummaryItem
          label="Сертификаты без дублей"
          value={intermediatePackage.summary.certificates}
        />
        <SummaryItem
          label="Документы / чертежи без дублей"
          value={intermediatePackage.summary.objectDocuments}
        />
        <SummaryItem label="Всего позиций" value={intermediatePackage.summary.total} />
      </dl>

      <div className="final-package-groups">
        {intermediatePackage.groups.map((group) => (
          <FinalPackageGroupSection group={group} key={group.id} />
        ))}
      </div>
    </section>
  );
}

interface FolderPackageOverviewProps {
  readonly packages: readonly IntermediateIdPackageModel[];
}

function FolderPackageOverview({ packages }: FolderPackageOverviewProps): React.JSX.Element {
  return (
    <section className="intermediate-package-overview" aria-labelledby="intermediate-package-title">
      <div className="intermediate-package-overview__heading">
        <div>
          <p className="section-kicker">Папки ИД</p>
          <h3 id="intermediate-package-title">Промежуточная ИД по папкам</h3>
        </div>
        <p>Состав промежуточной печати по каждой папке.</p>
      </div>

      <div className="intermediate-package-list">
        {packages.map((idPackage) => (
          <article className="intermediate-package-row" key={idPackage.id}>
            <div>
              <p className="section-tag">Папка</p>
              <h4>{idPackage.folderName}</h4>
              <p>{idPackage.title}</p>
            </div>
            <dl aria-label={`Состав пакета ${idPackage.folderName}`}>
              <SummaryItem label="Документы" value={idPackage.summary.acts} />
              <SummaryItem
                label="Использовано сертификатов"
                value={idPackage.summary.usedCertificates}
              />
              <SummaryItem label="Документы объекта" value={idPackage.summary.objectDocuments} />
            </dl>
          </article>
        ))}
      </div>
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

interface FinalPackageGroupSectionProps {
  readonly group: FinalPackageGroup;
}

function FinalPackageGroupSection({ group }: FinalPackageGroupSectionProps): React.JSX.Element {
  const headingId = `final-package-group-${group.id}`;

  return (
    <section className="object-documents-panel" aria-labelledby={headingId}>
      <div className="object-documents-panel__header">
        <div>
          <p className="section-kicker">Группа</p>
          <h3 id={headingId}>{group.title}</h3>
          {group.registry !== undefined ? (
            <p className="derived-registry-context">{group.registry.description}</p>
          ) : null}
        </div>
      </div>

      {group.registry !== undefined ? (
        <DerivedRegistryTable registry={group.registry} />
      ) : (
        <div className="object-documents-table-wrap">
          <table className="object-documents-table final-package-table">
            <thead>
              <tr>
                <th scope="col">Наименование</th>
                <th scope="col">Номер</th>
                <th scope="col">Дата</th>
                <th scope="col">Детали</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>{item.number}</td>
                  <td>{item.date}</td>
                  <td>{item.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
