import type { SyntheticEvent } from 'react';

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
            <h2 id="object-settings-title">Настройки объекта</h2>
          </span>
          <button className="compact-toggle" onClick={onCloseObjectSettings} type="button">
            Закрыть настройки
          </button>
        </div>

        <div className="compact-summary-list" aria-label="Кратко об объектовых настройках">
          <span>{objectDefaults.headerOrganizations.length} блока шапки</span>
          <span>{objectDefaults.representativeLibrary.length} назначений представителей</span>
          <span>текст под заголовком задан на объекте</span>
          <span>проектная документация задана на объекте</span>
          <span>нормативная база задана на объекте</span>
        </div>
        <p className="helper-note">
          Демо-назначения уже заполнены; в реальной модели пользователь выбирает представителя из
          глобальной библиотеки и назначает его на объект.
        </p>

        <div className="object-settings-dialog__body">
          <section className="form-section" aria-labelledby="object-data-title">
            <h3 id="object-data-title">Объектовые значения по умолчанию</h3>
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
                Текст под заголовком акта
                <textarea
                  className="medium-field"
                  name="defaultUnderTitleText"
                  onChange={(event) => {
                    onUpdateObjectDefaults('defaultUnderTitleText', event.currentTarget.value);
                  }}
                  rows={3}
                  value={objectDefaults.defaultUnderTitleText}
                />
              </label>
              <label className="act-form-grid__wide">
                Проектная документация по умолчанию
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
            </div>
          </section>

          <section className="form-section" aria-labelledby="object-compliance-title">
            <h3 id="object-compliance-title">Нормативная и проектная база объекта</h3>
            <p className="helper-note">
              Этот текст автоматически используется в пункте 6 текущего акта, пока для акта не
              задано отдельное исключение.
            </p>
            <label className="act-form-grid__wide">
              Текст для пункта 6. Соответствие работ предъявляемым требованиям
              <textarea
                className="large-field"
                name="defaultComplianceStatement"
                onChange={(event) => {
                  onUpdateObjectDefaults('defaultComplianceStatement', event.currentTarget.value);
                }}
                rows={6}
                value={objectDefaults.defaultComplianceStatement}
              />
            </label>
          </section>

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

          <DemoObjectRepresentativesPanel
            form={libraryRepresentativeForm}
            globalRepresentatives={globalRepresentatives}
            isFormOpen={isRepresentativeLibraryFormOpen}
            isLibraryOpen={isRepresentativeLibraryOpen}
            objectRepresentatives={objectDefaults.representativeLibrary}
            representativeSearch={representativeSearch}
            onChangeForm={onChangeLibraryRepresentativeForm}
            onChangeSearch={onChangeRepresentativeSearch}
            onSelectGlobalRepresentative={onSelectGlobalRepresentative}
            onSubmit={onAddLibraryRepresentative}
            onToggleForm={onToggleRepresentativeLibraryForm}
            onToggleLibrary={onToggleRepresentativeLibrary}
          />
        </div>
      </section>
    </div>
  );
}
