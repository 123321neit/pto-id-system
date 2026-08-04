import { useEffect, useState, type SyntheticEvent } from 'react';

import type { SectionTemplateClipboard } from '../app-shell/section-template-clipboard.js';
import type {
  DemoAosrObjectDefaults,
  DemoAosrObjectDefaultsField,
  DemoAosrRepresentative,
  DemoDocumentNumberingAffixField,
  DemoDocumentNumberingMode,
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
  readonly lastTemplateCopyMessage: string;
  readonly libraryRepresentativeForm: RepresentativeFormState;
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly organizationSearch: string;
  readonly objectId?: string | undefined;
  readonly objectTitle?: string | undefined;
  readonly presentation?: 'dialog' | 'page';
  readonly representativeSearch: string;
  readonly automaticSectionDraftCount: number;
  readonly sectionId?: string | undefined;
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
  readonly onCopySectionTemplate?: (() => void) | undefined;
  readonly onMoveHeaderOrganization: (
    headerOrganizationId: string,
    direction: MoveDirection,
  ) => void;
  readonly onSelectGlobalOrganization: (organization: DemoGlobalOrganization) => void;
  readonly onSelectGlobalRepresentative: (representative: DemoAosrRepresentative) => void;
  readonly onCloseObjectSettings: () => void;
  readonly sectionName?: string | undefined;
  readonly sectionTemplateClipboard?: SectionTemplateClipboard | null;
  readonly onToggleHeaderOrganizationForm: () => void;
  readonly onToggleRepresentativeLibraryForm: () => void;
  readonly onUpdateHeaderOrganization: (
    headerOrganization: DemoAosrObjectDefaults['headerOrganizations'][number],
    field: 'caption' | 'details' | 'label' | 'organizationName',
    value: string,
  ) => void;
  readonly onUpdateNumberingAffix: (field: DemoDocumentNumberingAffixField, value: string) => void;
  readonly onUpdateNumberingMode: (numberingMode: DemoDocumentNumberingMode) => void;
  readonly onUpdateNumberingScope: (numberingScope: DemoDocumentNumberingScope) => void;
  readonly onUpdateNumberingStart: (numberingStart: number) => void;
  readonly onUpdateObjectDefaults: (field: DemoAosrObjectDefaultsField, value: string) => void;
  readonly onPasteSectionTemplate?: (() => void) | undefined;
  readonly onRenumberSectionDrafts?: (() => void) | undefined;
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
  lastTemplateCopyMessage,
  libraryRepresentativeForm,
  objectDefaults,
  organizationSearch,
  objectId,
  objectTitle,
  presentation = 'dialog',
  representativeSearch,
  automaticSectionDraftCount,
  sectionId,
  onAddHeaderOrganization,
  onAddLibraryRepresentative,
  onChangeHeaderOrganizationForm,
  onChangeLibraryRepresentativeForm,
  onChangeOrganizationSearch,
  onChangeRepresentativeSearch,
  onCopySectionTemplate,
  onMoveHeaderOrganization,
  onSelectGlobalOrganization,
  onSelectGlobalRepresentative,
  onCloseObjectSettings,
  sectionName,
  sectionTemplateClipboard,
  onToggleHeaderOrganizationForm,
  onToggleRepresentativeLibraryForm,
  onUpdateHeaderOrganization,
  onUpdateNumberingAffix,
  onUpdateNumberingMode,
  onUpdateNumberingScope,
  onUpdateNumberingStart,
  onUpdateObjectDefaults,
  onPasteSectionTemplate,
  onRenumberSectionDrafts,
  onUpdateRepresentative,
  onUpdateRepresentativeGroupTitle,
}: DemoObjectSettingsPanelProps): React.JSX.Element {
  const [activeSectionId, setActiveSectionId] = useState<ObjectSettingsSectionId>('main');
  const numberingStart =
    Number.isInteger(objectDefaults.objectTemplate.numberingStart) &&
    objectDefaults.objectTemplate.numberingStart > 0
      ? objectDefaults.objectTemplate.numberingStart
      : 1;
  const isAutomaticNumbering = objectDefaults.objectTemplate.numberingMode === 'automatic';
  const firstNumberingExample = `${objectDefaults.objectTemplate.numberingPrefix}${String(numberingStart)}${objectDefaults.objectTemplate.numberingSuffix}`;
  const [numberingStartInput, setNumberingStartInput] = useState(() => String(numberingStart));
  const isSectionScopedTemplate = sectionName !== undefined;
  const selectedSectionName = sectionName ?? 'выбранный раздел';
  const selectedObjectTitle = objectTitle ?? 'текущий объект';
  const dialogTitle = isSectionScopedTemplate
    ? `Шаблонные значения раздела «${selectedSectionName}»`
    : 'Шаблонные значения';
  const isPagePresentation = presentation === 'page';
  const isClipboardFromCurrentSection =
    sectionTemplateClipboard !== null &&
    sectionTemplateClipboard !== undefined &&
    sectionTemplateClipboard.sourceObjectId === objectId &&
    sectionTemplateClipboard.sourceSectionId === sectionId;

  useEffect(() => {
    setNumberingStartInput(String(numberingStart));
  }, [numberingStart]);

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

        {isSectionScopedTemplate ? (
          <section className="form-section" aria-labelledby="section-template-copy-title">
            <div className="template-copy-compact">
              <div className="template-copy-compact__heading">
                <h3 id="section-template-copy-title">Копирование шаблонных значений</h3>
                <p>Скопируйте значения здесь, вставьте в другом разделе.</p>
              </div>

              <div className="template-copy-compact__row">
                <button
                  className="compact-toggle compact-toggle--accent"
                  disabled={onCopySectionTemplate === undefined}
                  onClick={onCopySectionTemplate}
                  type="button"
                >
                  Скопировать
                </button>

                <p className="template-copy-compact__status" role="note">
                  {sectionTemplateClipboard === null || sectionTemplateClipboard === undefined
                    ? 'Буфер пуст. Скопируйте значения в одном разделе, затем вставьте в другом.'
                    : isClipboardFromCurrentSection
                      ? 'В буфере значения этого же раздела. Вставка сюда недоступна.'
                      : `В буфере: «${sectionTemplateClipboard.sourceSectionName}» · объект «${sectionTemplateClipboard.sourceObjectTitle}»`}
                </p>

                {sectionTemplateClipboard === null ||
                sectionTemplateClipboard === undefined ? null : (
                  <button
                    className="compact-toggle"
                    disabled={isClipboardFromCurrentSection || onPasteSectionTemplate === undefined}
                    onClick={onPasteSectionTemplate}
                    type="button"
                  >
                    Вставить
                  </button>
                )}
              </div>

              <details className="template-copy-details">
                <summary>Что копируется и что не копируется</summary>
                <div className="template-copy-details__grid">
                  <div>
                    <h4>Что копируется</h4>
                    <p>
                      Объект и участники, организации, представители, проектная документация, текст
                      соответствия, дополнительные данные и настройки нумерации кроме префикса.
                    </p>
                  </div>
                  <div>
                    <h4>Что не копируется</h4>
                    <p>Папки, акты, выпущенные комплекты, файлы и ручные версии актов.</p>
                  </div>
                </div>
              </details>

              {sectionTemplateClipboard !== null &&
              sectionTemplateClipboard !== undefined &&
              !isClipboardFromCurrentSection ? (
                <p className="template-copy-compact__hint">
                  При вставке в раздел «{selectedSectionName}» объекта «{selectedObjectTitle}»
                  префикс текущего раздела сохранится.
                </p>
              ) : null}

              {lastTemplateCopyMessage !== '' ? (
                <p className="template-copy-message">{lastTemplateCopyMessage}</p>
              ) : null}
            </div>
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
                    <label>
                      Количество экземпляров
                      <input
                        aria-label="Количество экземпляров"
                        name="defaultCopiesLine"
                        onChange={(event) => {
                          onUpdateObjectDefaults('defaultCopiesLine', event.currentTarget.value);
                        }}
                        value={objectDefaults.defaultCopiesLine}
                      />
                      <small>Только число или форма числа, без слов «в … экземплярах».</small>
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
                        Настройка применяется к новым актам этого раздела. Уже созданные номера
                        меняются только по кнопке массовой перенумерации.
                      </p>
                    </span>
                  </div>
                  <p className="object-folders__empty-copy">
                    Пример первого номера: {firstNumberingExample}
                  </p>

                  <fieldset className="object-numbering-scope">
                    <legend>Режим нумерации</legend>
                    <label>
                      <input
                        checked={objectDefaults.objectTemplate.numberingMode === 'automatic'}
                        name="numberingMode"
                        onChange={() => {
                          onUpdateNumberingMode('automatic');
                        }}
                        type="radio"
                      />
                      <span>
                        <strong>Автоматическая</strong>
                        <small>
                          Новые акты будут получать номер автоматически по выбранному правилу.
                        </small>
                      </span>
                    </label>
                    <label>
                      <input
                        checked={objectDefaults.objectTemplate.numberingMode === 'manual'}
                        name="numberingMode"
                        onChange={() => {
                          onUpdateNumberingMode('manual');
                        }}
                        type="radio"
                      />
                      <span>
                        <strong>Ручная</strong>
                        <small>
                          Новые акты будут создаваться без номера. Номер можно ввести в редакторе
                          акта.
                        </small>
                      </span>
                    </label>
                  </fieldset>

                  <fieldset className="object-numbering-scope">
                    <legend>Порядок нумерации</legend>
                    <label>
                      <input
                        disabled={!isAutomaticNumbering}
                        checked={objectDefaults.objectTemplate.numberingScope === 'section-wide'}
                        name="numberingScope"
                        onChange={() => {
                          onUpdateNumberingScope('section-wide');
                        }}
                        type="radio"
                      />
                      <span>
                        <strong>Сквозная по разделу</strong>
                        <small>В разделе одна последовательность номеров для всех папок.</small>
                      </span>
                    </label>
                    <label>
                      <input
                        disabled={!isAutomaticNumbering}
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
                        <small>В каждой папке последовательность начинается отдельно.</small>
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
                      Первый номер
                      <input
                        min={1}
                        name="numberingStart"
                        onChange={(event) => {
                          const nextValue = event.currentTarget.value;
                          const nextNumberingStart = Number(nextValue);

                          setNumberingStartInput(nextValue);

                          if (Number.isInteger(nextNumberingStart) && nextNumberingStart > 0) {
                            onUpdateNumberingStart(nextNumberingStart);
                          }
                        }}
                        onBlur={() => {
                          const nextNumberingStart = Number(numberingStartInput);

                          if (!Number.isInteger(nextNumberingStart) || nextNumberingStart <= 0) {
                            setNumberingStartInput('1');
                            onUpdateNumberingStart(1);
                          }
                        }}
                        step={1}
                        type="number"
                        value={numberingStartInput}
                      />
                      <small>По умолчанию 1. Можно начать, например, с 100 или 200.</small>
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

                  {isAutomaticNumbering ? (
                    <div className="object-numbering-actions">
                      <button
                        className="compact-toggle compact-toggle--accent"
                        disabled={
                          automaticSectionDraftCount === 0 ||
                          onRenumberSectionDrafts === undefined
                        }
                        onClick={onRenumberSectionDrafts}
                        type="button"
                      >
                        Пересчитать автоматические номера
                      </button>
                      {automaticSectionDraftCount === 0 ? (
                        <p className="object-folders__empty-copy">
                          В разделе нет актов с автоматической нумерацией.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="object-folders__empty-copy">
                      Ручная нумерация не спрашивает номер при создании акта и не переводит акт в
                      ручной режим шаблонных значений.
                    </p>
                  )}
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
