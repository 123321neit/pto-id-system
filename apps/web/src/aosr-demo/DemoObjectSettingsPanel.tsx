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
  readonly copyTargetSections: readonly {
    readonly id: string;
    readonly name: string;
  }[];
  readonly globalOrganizations: readonly DemoGlobalOrganization[];
  readonly globalRepresentatives: readonly DemoAosrRepresentative[];
  readonly headerOrganizationForm: HeaderOrganizationFormState;
  readonly isHeaderOrganizationFormOpen: boolean;
  readonly isRepresentativeLibraryFormOpen: boolean;
  readonly lastTemplateCopyMessage: string;
  readonly libraryRepresentativeForm: RepresentativeFormState;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly organizationSearch: string;
  readonly presentation?: 'dialog' | 'page';
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
  readonly onCopySectionTemplateFromSource?: ((sectionId: string) => void) | undefined;
  readonly onCopySectionTemplateToTarget?: ((sectionId: string) => void) | undefined;
  readonly onMoveHeaderOrganization: (
    headerOrganizationId: string,
    direction: MoveDirection,
  ) => void;
  readonly onSelectGlobalOrganization: (organization: DemoGlobalOrganization) => void;
  readonly onSelectGlobalRepresentative: (representative: DemoAosrRepresentative) => void;
  readonly onCloseObjectSettings: () => void;
  readonly sectionName?: string | undefined;
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
  copyTargetSections,
  globalOrganizations,
  globalRepresentatives,
  headerOrganizationForm,
  isHeaderOrganizationFormOpen,
  isRepresentativeLibraryFormOpen,
  lastTemplateCopyMessage,
  libraryRepresentativeForm,
  objectDefaults,
  organizationSearch,
  presentation = 'dialog',
  representativeSearch,
  onAddHeaderOrganization,
  onAddLibraryRepresentative,
  onChangeHeaderOrganizationForm,
  onChangeLibraryRepresentativeForm,
  onChangeOrganizationSearch,
  onChangeRepresentativeSearch,
  onCopySectionTemplateFromSource,
  onCopySectionTemplateToTarget,
  onMoveHeaderOrganization,
  onSelectGlobalOrganization,
  onSelectGlobalRepresentative,
  onCloseObjectSettings,
  sectionName,
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
  const representativeGroupCount = objectDefaults.objectTemplate.representativeGroups.length;
  const representativeMemberCount = objectDefaults.objectTemplate.representativeGroups.reduce(
    (count, group) => count + group.members.length,
    0,
  );
  const numberingExample = `${objectDefaults.objectTemplate.numberingPrefix}1${objectDefaults.objectTemplate.numberingSuffix}`;
  const numberingScopeLabel =
    objectDefaults.objectTemplate.numberingScope === 'global-section'
      ? sectionName === undefined
        ? 'сквозная по объекту'
        : 'сквозная по разделу'
      : 'отдельно в каждой папке';
  const isSectionScopedTemplate = sectionName !== undefined;
  const selectedSectionName = sectionName ?? 'выбранный раздел';
  const dialogTitle = isSectionScopedTemplate
    ? `Шаблонные значения раздела «${selectedSectionName}»`
    : 'Шаблонные значения';
  const isPagePresentation = presentation === 'page';

  return (
    <div className={isPagePresentation ? 'object-settings-page' : 'object-settings-overlay'}>
      <section
        aria-labelledby="object-settings-title"
        aria-modal={isPagePresentation ? undefined : true}
        className="object-settings-dialog"
        role={isPagePresentation ? 'region' : 'dialog'}
      >
        <div className="object-settings-dialog__header">
          <span>
            <p className="scope-label">
              {isSectionScopedTemplate ? `Раздел ИД: ${selectedSectionName}` : 'Общие значения'}
            </p>
            <h2 id="object-settings-title">{dialogTitle}</h2>
            <p className="object-settings-dialog__lead">
              Эти данные автоматически подставляются в новые акты и в акты, связанные с шаблонными
              значениями раздела.
            </p>
          </span>
          <button className="compact-toggle" onClick={onCloseObjectSettings} type="button">
            {isPagePresentation ? 'Вернуться к разделу' : 'Закрыть'}
          </button>
        </div>

        <section className="object-template-status" aria-label="Сводка шаблонных значений">
          <article className="object-template-status__card object-template-status__card--wide">
            <span>Как применяются значения</span>
            <strong>
              {isSectionScopedTemplate
                ? 'Библиотеки → шаблонные значения раздела → связанные акты'
                : 'Библиотеки → шаблонные значения → связанные акты'}
            </strong>
            <small>
              Изменения видны новым и связанным актам. Ручные акты остаются отдельными версиями.
            </small>
          </article>
          <article className="object-template-status__card">
            <span>Организации</span>
            <strong>{objectDefaults.headerOrganizations.length} блока</strong>
            <small>Порядок шапки печатного АОСР</small>
          </article>
          <article className="object-template-status__card">
            <span>Представители</span>
            <strong>
              {representativeGroupCount} группы / {representativeMemberCount} участника
            </strong>
            <small>
              {isSectionScopedTemplate
                ? 'Назначения раздела для подписей'
                : 'Назначения объекта для подписей'}
            </small>
          </article>
          <article className="object-template-status__card">
            <span>Нумерация</span>
            <strong>{numberingExample}</strong>
            <small>{numberingScopeLabel}</small>
          </article>
        </section>

        {isSectionScopedTemplate ? (
          <section className="form-section" aria-labelledby="section-template-copy-title">
            <div className="object-numbering-heading">
              <span>
                <h3 id="section-template-copy-title">Копирование шаблонных значений</h3>
                <p>
                  Можно взять значения из другого раздела или скопировать текущие значения в другой
                  раздел. Папки, акты, выпущенные комплекты и файлы не копируются.
                </p>
                <p>
                  Префикс нумерации целевого раздела не копируется: он остаётся своим, чтобы раздел
                  не получил чужое обозначение.
                </p>
              </span>
            </div>
            <div className="template-copy-grid">
              <section className="template-copy-card" aria-labelledby="copy-from-section-title">
                <h4 id="copy-from-section-title">Копировать из раздела</h4>
                {copyTargetSections.length === 0 ? (
                  <p className="object-folders__empty-copy">
                    Создайте ещё один раздел, чтобы можно было скопировать значения.
                  </p>
                ) : (
                  <div className="object-folder-create-panel__actions">
                    {copyTargetSections.map((sourceSection) => (
                      <button
                        className="compact-toggle"
                        key={sourceSection.id}
                        onClick={() => {
                          onCopySectionTemplateFromSource?.(sourceSection.id);
                        }}
                        type="button"
                      >
                        Скопировать из «{sourceSection.name}»
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="template-copy-card" aria-labelledby="copy-to-section-title">
                <h4 id="copy-to-section-title">Копировать в раздел</h4>
                {copyTargetSections.length === 0 ? (
                  <p className="object-folders__empty-copy">
                    Других разделов в этом объекте пока нет.
                  </p>
                ) : (
                  <div className="object-folder-create-panel__actions">
                    {copyTargetSections.map((targetSection) => (
                      <button
                        className="compact-toggle"
                        key={targetSection.id}
                        onClick={() => {
                          onCopySectionTemplateToTarget?.(targetSection.id);
                        }}
                        type="button"
                      >
                        Скопировать в «{targetSection.name}»
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="template-copy-card" aria-labelledby="copy-from-object-title">
                <h4 id="copy-from-object-title">Копировать из другого объекта</h4>
                <label>
                  Объект
                  <select disabled>
                    <option>Поликлиника, корпус А — Вентиляция</option>
                  </select>
                </label>
                <button className="compact-toggle" disabled type="button">
                  Просмотреть и скопировать — скоро
                </button>
              </section>

              <section className="template-copy-card" aria-labelledby="copy-from-saved-title">
                <h4 id="copy-from-saved-title">Сохранить как шаблон</h4>
                <button className="compact-toggle" disabled type="button">
                  Сохранить текущие значения — скоро
                </button>
              </section>
            </div>

            <div className="template-copy-summary" aria-label="Что будет скопировано">
              <div>
                <h4>Что будет скопировано</h4>
                <ul>
                  <li>объект и участники;</li>
                  <li>представители;</li>
                  <li>проектная документация;</li>
                  <li>нумерация, кроме префикса текущего раздела;</li>
                  <li>дополнительные шаблонные данные.</li>
                </ul>
              </div>
              <div>
                <h4>Что не копируется</h4>
                <ul>
                  <li>папки;</li>
                  <li>акты;</li>
                  <li>выпущенные комплекты;</li>
                  <li>файлы.</li>
                </ul>
              </div>
            </div>

            {lastTemplateCopyMessage !== '' ? (
              <p className="template-copy-message">{lastTemplateCopyMessage}</p>
            ) : null}
          </section>
        ) : null}

        <div className="object-settings-layout">
          <nav
            className="object-settings-menu"
            aria-label={
              isSectionScopedTemplate
                ? 'Разделы шаблонных значений раздела'
                : 'Разделы шаблонных значений'
            }
          >
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
                      <p>
                        Правило применяется к новым актам{' '}
                        {isSectionScopedTemplate ? 'этого раздела' : 'этого объекта'}. Уже созданные
                        номера не перенумеровываются автоматически.
                      </p>
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
                        checked={objectDefaults.objectTemplate.numberingScope === 'global-section'}
                        name="numberingScope"
                        onChange={() => {
                          onUpdateNumberingScope('global-section');
                        }}
                        type="radio"
                      />
                      <span>
                        <strong>
                          {isSectionScopedTemplate ? 'Сквозная по разделу' : 'Сквозная по объекту'}
                        </strong>
                        <small>
                          {isSectionScopedTemplate
                            ? 'Одна последовательность во всех папках раздела'
                            : 'Одна последовательность во всех папках'}
                        </small>
                      </span>
                    </label>
                    <label>
                      <input
                        checked={
                          objectDefaults.objectTemplate.numberingScope === 'restart-per-folder'
                        }
                        name="numberingScope"
                        onChange={() => {
                          onUpdateNumberingScope('restart-per-folder');
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
                  <h3 id="object-project-docs-title">6. Документы-основания</h3>
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
                  <h3 id="object-compliance-title">7. Соответствие работ требованиям</h3>
                  <label className="act-form-grid__wide">
                    Текст соответствия работ требованиям
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
