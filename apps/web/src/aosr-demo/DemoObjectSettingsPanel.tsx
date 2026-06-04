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
  readonly isObjectSettingsOpen: boolean;
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
  readonly onToggleHeaderOrganizationForm: () => void;
  readonly onToggleObjectSettings: () => void;
  readonly onToggleRepresentativeLibrary: () => void;
  readonly onToggleRepresentativeLibraryForm: () => void;
  readonly onUpdateObjectDefaults: (field: DemoAosrObjectDefaultsField, value: string) => void;
}

export function DemoObjectSettingsPanel({
  globalOrganizations,
  globalRepresentatives,
  headerOrganizationForm,
  isHeaderOrganizationFormOpen,
  isObjectSettingsOpen,
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
  onToggleHeaderOrganizationForm,
  onToggleObjectSettings,
  onToggleRepresentativeLibrary,
  onToggleRepresentativeLibraryForm,
  onUpdateObjectDefaults,
}: DemoObjectSettingsPanelProps): React.JSX.Element {
  return (
    <section
      className="form-section form-section--scope form-section--object-scope"
      aria-labelledby="object-settings-title"
    >
      <div className="scope-heading scope-heading--with-action">
        <span>
          <p className="scope-label">Уровень объекта</p>
          <h3 id="object-settings-title">Настройки объекта</h3>
        </span>
        <button
          aria-controls="object-settings-panel"
          aria-expanded={isObjectSettingsOpen}
          className="compact-toggle"
          onClick={onToggleObjectSettings}
          type="button"
        >
          {isObjectSettingsOpen ? 'Свернуть объектовые настройки' : 'Открыть объектовые настройки'}
        </button>
      </div>

      <div className="compact-summary-list" aria-label="Кратко об объектовых настройках">
        <span>{objectDefaults.headerOrganizations.length} блока шапки</span>
        <span>{objectDefaults.representativeLibrary.length} представителей объекта</span>
        <span>проектная документация задана на объекте</span>
      </div>
      <p className="helper-note">
        Демо-база представителей уже заполнена; на реальном объекте пользователь выбирает их сам.
      </p>

      {isObjectSettingsOpen ? (
        <div className="disclosure-panel" id="object-settings-panel">
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
      ) : null}
    </section>
  );
}
