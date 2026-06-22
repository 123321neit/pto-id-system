import { useState, type SyntheticEvent } from 'react';

import type {
  DemoAosrObjectDefaults,
  DemoAosrObjectDefaultsField,
  DemoAosrRepresentative,
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
  readonly isRepresentativeLibraryOpen: boolean;
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
  readonly onToggleRepresentativeLibrary: () => void;
  readonly onToggleRepresentativeLibraryForm: () => void;
  readonly onUpdateObjectDefaults: (field: DemoAosrObjectDefaultsField, value: string) => void;
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
  isRepresentativeLibraryOpen,
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
  onToggleRepresentativeLibrary,
  onToggleRepresentativeLibraryForm,
  onUpdateObjectDefaults,
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
              />
            ) : null}

            {activeSectionId === 'representatives' ? (
              <DemoObjectRepresentativesPanel
                form={libraryRepresentativeForm}
                globalRepresentatives={globalRepresentatives}
                isFormOpen={isRepresentativeLibraryFormOpen}
                isLibraryOpen={isRepresentativeLibraryOpen}
                objectRepresentatives={objectDefaults.representativeLibrary}
                representativeGroups={objectDefaults.objectTemplate.representativeGroups}
                representativeSearch={representativeSearch}
                onChangeForm={onChangeLibraryRepresentativeForm}
                onChangeSearch={onChangeRepresentativeSearch}
                onSelectGlobalRepresentative={onSelectGlobalRepresentative}
                onSubmit={onAddLibraryRepresentative}
                onToggleForm={onToggleRepresentativeLibraryForm}
                onToggleLibrary={onToggleRepresentativeLibrary}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
