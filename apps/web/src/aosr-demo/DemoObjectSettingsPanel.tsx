import { useState, type SyntheticEvent } from 'react';

import type {
  DemoAosrObjectDefaults,
  DemoAosrObjectDefaultsField,
  DemoAosrRepresentative,
  DemoDocumentNumberingAffixField,
  DemoDocumentNumberingScope,
  DemoGlobalOrganization,
} from './demo-aosr-workspace.js';
import type {
  HeaderOrganizationFormState,
  MoveDirection,
  RepresentativeFormState,
} from './demo-aosr-ui.js';
import { DemoHeaderOrganizationsPanel } from './DemoHeaderOrganizationsPanel.js';
import { DemoObjectRepresentativesPanel } from './DemoObjectRepresentativesPanel.js';

interface DemoObjectSettingsPanelProps {
  readonly globalOrganizations: readonly DemoGlobalOrganization[];
  readonly globalRepresentatives: readonly DemoAosrRepresentative[];
  readonly headerOrganizationForm: HeaderOrganizationFormState;
  readonly isHeaderOrganizationFormOpen: boolean;
  readonly isRepresentativeLibraryFormOpen: boolean;
  readonly libraryRepresentativeForm: RepresentativeFormState;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly organizationSearch: string;
  readonly representativeSearch: string;
  readonly onAddHeaderOrganization: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onAddLibraryRepresentative: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onChangeHeaderOrganizationForm: (
    field: keyof HeaderOrganizationFormState,
    value: string,
  ) => void;
  readonly onChangeLibraryRepresentativeForm: (
    field: keyof RepresentativeFormState,
    value: string,
  ) => void;
  readonly onChangeOrganizationSearch: (value: string) => void;
  readonly onChangeRepresentativeSearch: (value: string) => void;
  readonly onMoveHeaderOrganization: (
    headerOrganizationId: string,
    direction: MoveDirection,
  ) => void;
  readonly onSelectGlobalOrganization: (organization: DemoGlobalOrganization) => void;
  readonly onSelectGlobalRepresentative: (representative: DemoAosrRepresentative) => void;
  readonly onCloseObjectSettings: () => void;
  readonly onToggleHeaderOrganizationForm: () => void;
  readonly onToggleRepresentativeLibraryForm: () => void;
  readonly onUpdateHeaderOrganization: (
    headerOrganization: DemoAosrObjectDefaults['headerOrganizations'][number],
    field: 'caption' | 'details' | 'label' | 'organizationName',
    value: string,
  ) => void;
  readonly onUpdateNumberingAffix: (field: DemoDocumentNumberingAffixField, value: string) => void;
  readonly onUpdateNumberingScope: (numberingScope: DemoDocumentNumberingScope) => void;
  readonly onUpdateObjectDefaults: (field: DemoAosrObjectDefaultsField, value: string) => void;
  readonly onUpdateRepresentative: (
    groupId: string,
    memberId: string,
    signatoryId: string,
    field: 'authorityBasis' | 'details' | 'fullName' | 'nrsId' | 'organization' | 'position',
    value: string,
  ) => void;
  readonly onUpdateRepresentativeGroupTitle: (groupId: string, value: string) => void;
}

type ObjectSettingsSectionId = 'main' | 'header' | 'representatives';

const objectSettingsSections: readonly {
  readonly id: ObjectSettingsSectionId;
  readonly label: string;
  readonly summary: string;
}[] = [
  {
    id: 'main',
    label: 'Данные и тексты',
    summary: 'Объект и повторяющиеся поля',
  },
  {
    id: 'header',
    label: 'Организации',
    summary: 'Блоки и печатный порядок',
  },
  {
    id: 'representatives',
    label: 'Представители',
    summary: 'Группы и участники',
  },
];

export function DemoObjectSettingsPanel({
  globalOrganizations,
  globalRepresentatives,
  headerOrganizationForm,
  isHeaderOrganizationFormOpen,
  isRepresentativeLibraryFormOpen,
  libraryRepresentativeForm,
  objectDefaults,
  organizationSearch,
  representativeSearch,
  onAddHeaderOrganization,
  onAddLibraryRepresentative,
  onChangeHeaderOrganizationForm,
  onChangeLibraryRepresentativeForm,
  onChangeOrganizationSearch,
  onChangeRepresentativeSearch,
  onMoveHeaderOrganization,
  onSelectGlobalOrganization,
  onSelectGlobalRepresentative,
  onCloseObjectSettings,
  onToggleHeaderOrganizationForm,
  onToggleRepresentativeLibraryForm,
  onUpdateHeaderOrganization,
  onUpdateNumberingAffix,
  onUpdateNumberingScope,
  onUpdateObjectDefaults,
  onUpdateRepresentative,
  onUpdateRepresentativeGroupTitle,
}: DemoObjectSettingsPanelProps): React.JSX.Element {
  const [activeSectionId, setActiveSectionId] = useState<ObjectSettingsSectionId>('main');

  return (
    <div className="object-settings-overlay">
      <section
        aria-labelledby="object-settings-title"
        aria-modal="true"
        className="object-settings-dialog"
        role="dialog"
      >
        <div className="object-settings-dialog__header">
          <span>
            <p className="scope-label">Уровень объекта</p>
            <h2 id="object-settings-title">Шаблон объекта</h2>
          </span>
          <button className="compact-toggle" onClick={onCloseObjectSettings} type="button">
            Закрыть
          </button>
        </div>

        <div className="object-settings-layout">
          <nav className="object-settings-menu" aria-label="Разделы шаблона объекта">
            {objectSettingsSections.map((section) => (
              <button
                aria-current={activeSectionId === section.id ? 'page' : undefined}
                key={section.id}
                onClick={() => {
                  setActiveSectionId(section.id);
                }}
                type="button"
              >
                <strong>{section.label}</strong>
                <small>{section.summary}</small>
              </button>
            ))}
          </nav>

          <div className="object-settings-dialog__body object-settings-panel">
            {activeSectionId === 'main' ? (
              <div className="object-settings-section-list">
                <section className="form-section" aria-labelledby="object-data-title">
                  <h3 id="object-data-title">Объект и общие данные</h3>
                  <div className="act-form-grid">
                    <label className="act-form-grid__wide">
                      Название проекта / объекта
                      <input
                        name="projectName"
                        onChange={(event) => {
                          onUpdateObjectDefaults('projectName', event.currentTarget.value);
                        }}
                        value={objectDefaults.projectName}
                      />
                    </label>
                    <label className="act-form-grid__wide">
                      Объект капитального строительства
                      <textarea
                        className="medium-field"
                        name="objectName"
                        onChange={(event) => {
                          onUpdateObjectDefaults('objectName', event.currentTarget.value);
                        }}
                        rows={3}
                        value={objectDefaults.objectName}
                      />
                    </label>
                    <label className="act-form-grid__wide">
                      Подстрочный текст под названием объекта
                      <textarea
                        name="objectNameSubscript"
                        onChange={(event) => {
                          onUpdateObjectDefaults('objectNameSubscript', event.currentTarget.value);
                        }}
                        rows={2}
                        value={objectDefaults.objectNameSubscript}
                      />
                    </label>
                    <label>
                      Количество экземпляров
                      <input
                        name="defaultCopiesLine"
                        onChange={(event) => {
                          onUpdateObjectDefaults('defaultCopiesLine', event.currentTarget.value);
                        }}
                        value={objectDefaults.defaultCopiesLine}
                      />
                    </label>
                    <label className="act-form-grid__wide">
                      Лицо, выполнившее работы
                      <input
                        name="defaultWorkContractorName"
                        onChange={(event) => {
                          onUpdateObjectDefaults(
                            'defaultWorkContractorName',
                            event.currentTarget.value,
                          );
                        }}
                        value={objectDefaults.defaultWorkContractorName}
                      />
                    </label>
                  </div>
                </section>

                <section className="form-section" aria-labelledby="object-numbering-title">
                  <div className="object-numbering-heading">
                    <span>
                      <h3 id="object-numbering-title">Нумерация актов</h3>
                      <p>Правило применяется к новым актам этого объекта.</p>
                    </span>
                    <output aria-label="Пример номера" className="object-numbering-preview">
                      {objectDefaults.objectTemplate.numberingPrefix}1
                      {objectDefaults.objectTemplate.numberingSuffix}
                    </output>
                  </div>

                  <fieldset className="object-numbering-scope">
                    <legend>Порядок нумерации</legend>
                    <label>
                      <input
                        checked={objectDefaults.objectTemplate.numberingScope === 'global-object'}
                        name="numberingScope"
                        onChange={() => {
                          onUpdateNumberingScope('global-object');
                        }}
                        type="radio"
                      />
                      <span>
                        <strong>Сквозная по объекту</strong>
                        <small>Одна последовательность во всех папках</small>
                      </span>
                    </label>
                    <label>
                      <input
                        checked={
                          objectDefaults.objectTemplate.numberingScope === 'restart-per-period'
                        }
                        name="numberingScope"
                        onChange={() => {
                          onUpdateNumberingScope('restart-per-period');
                        }}
                        type="radio"
                      />
                      <span>
                        <strong>Отдельно в каждой папке</strong>
                        <small>В каждой папке последовательность начинается заново</small>
                      </span>
                    </label>
                  </fieldset>

                  <div className="act-form-grid object-numbering-affixes">
                    <label>
                      Префикс номера
                      <input
                        name="numberingPrefix"
                        onChange={(event) => {
                          onUpdateNumberingAffix('numberingPrefix', event.currentTarget.value);
                        }}
                        value={objectDefaults.objectTemplate.numberingPrefix}
                      />
                    </label>
                    <label>
                      Суффикс номера
                      <input
                        name="numberingSuffix"
                        onChange={(event) => {
                          onUpdateNumberingAffix('numberingSuffix', event.currentTarget.value);
                        }}
                        value={objectDefaults.objectTemplate.numberingSuffix}
                      />
                    </label>
                  </div>
                </section>

                <section className="form-section" aria-labelledby="object-project-docs-title">
                  <h3 id="object-project-docs-title">Пункт 4. Проектная документация</h3>
                  <label className="act-form-grid__wide">
                    Проектная документация шаблона
                    <textarea
                      className="large-field"
                      name="defaultProjectDocumentation"
                      onChange={(event) => {
                        onUpdateObjectDefaults(
                          'defaultProjectDocumentation',
                          event.currentTarget.value,
                        );
                      }}
                      rows={6}
                      value={objectDefaults.defaultProjectDocumentation}
                    />
                  </label>
                </section>

                <section className="form-section" aria-labelledby="object-compliance-title">
                  <h3 id="object-compliance-title">Пункт 6. Соответствие требованиям</h3>
                  <label className="act-form-grid__wide">
                    Текст для пункта 6. Соответствие работ предъявляемым требованиям
                    <textarea
                      className="large-field"
                      name="defaultComplianceStatement"
                      onChange={(event) => {
                        onUpdateObjectDefaults(
                          'defaultComplianceStatement',
                          event.currentTarget.value,
                        );
                      }}
                      rows={6}
                      value={objectDefaults.defaultComplianceStatement}
                    />
                  </label>
                </section>

                <section className="form-section" aria-labelledby="object-additional-info-title">
                  <h3 id="object-additional-info-title">Дополнительные сведения</h3>
                  <label className="act-form-grid__wide">
                    Печатный текст для актов объекта
                    <textarea
                      className="medium-field"
                      name="defaultAdditionalInfo"
                      onChange={(event) => {
                        onUpdateObjectDefaults('defaultAdditionalInfo', event.currentTarget.value);
                      }}
                      rows={3}
                      value={objectDefaults.defaultAdditionalInfo}
                    />
                  </label>
                </section>
              </div>
            ) : null}

            {activeSectionId === 'header' ? (
              <DemoHeaderOrganizationsPanel
                form={headerOrganizationForm}
                globalOrganizations={globalOrganizations}
                headerOrganizations={objectDefaults.headerOrganizations}
                isFormOpen={isHeaderOrganizationFormOpen}
                organizationSearch={organizationSearch}
                onChangeForm={onChangeHeaderOrganizationForm}
                onChangeSearch={onChangeOrganizationSearch}
                onMoveHeaderOrganization={onMoveHeaderOrganization}
                onSelectGlobalOrganization={onSelectGlobalOrganization}
                onSubmit={onAddHeaderOrganization}
                onToggleForm={onToggleHeaderOrganizationForm}
                onUpdateHeaderOrganization={onUpdateHeaderOrganization}
              />
            ) : null}

            {activeSectionId === 'representatives' ? (
              <DemoObjectRepresentativesPanel
                form={libraryRepresentativeForm}
                globalRepresentatives={globalRepresentatives}
                isFormOpen={isRepresentativeLibraryFormOpen}
                objectRepresentatives={objectDefaults.representativeLibrary}
                representativeGroups={objectDefaults.objectTemplate.representativeGroups}
                representativeSearch={representativeSearch}
                onChangeForm={onChangeLibraryRepresentativeForm}
                onChangeSearch={onChangeRepresentativeSearch}
                onSelectGlobalRepresentative={onSelectGlobalRepresentative}
                onSubmit={onAddLibraryRepresentative}
                onToggleForm={onToggleRepresentativeLibraryForm}
                onUpdateRepresentative={onUpdateRepresentative}
                onUpdateRepresentativeGroupTitle={onUpdateRepresentativeGroupTitle}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
