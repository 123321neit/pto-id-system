import type {
  DemoActApplication,
  DemoAosrDraft,
  DemoAosrObjectDefaults,
  DemoAosrRepresentative,
  DemoMaterialCertificate,
  DemoObjectDocument,
} from './demo-aosr-workspace.js';
import { getDraftComplianceStatement } from './demo-aosr-workspace.js';
import {
  formatDocumentDate,
  getRepresentativeAuthorityLine,
  getRepresentativePreviewLine,
} from './demo-aosr-ui.js';

interface DemoAosrPreviewProps {
  readonly finalApplications: readonly DemoActApplication[];
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly selectedDraft: DemoAosrDraft;
  readonly selectedMaterials: readonly DemoMaterialCertificate[];
  readonly selectedObjectDocuments: readonly DemoObjectDocument[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
}

export function DemoAosrPreview({
  finalApplications,
  objectDefaults,
  selectedDraft,
  selectedMaterials,
  selectedObjectDocuments,
  selectedSignatories,
}: DemoAosrPreviewProps): React.JSX.Element {
  const executingOrganization = getExecutingOrganization(selectedSignatories, objectDefaults);
  const complianceStatement = getDraftComplianceStatement(selectedDraft, objectDefaults);

  return (
    <section className="preview-panel" aria-labelledby="preview-title">
      <div className="panel-heading">
        <p className="section-kicker">HTML-макет печатной формы</p>
        <h2 id="preview-title">Предпросмотр АОСР</h2>
      </div>
      <article className="act-page" aria-label="Демо-предпросмотр печатной формы АОСР">
        <div className="act-page__sheet">
          <header className="act-page__top-blocks">
            <div className="act-page__header-block">
              <p className="act-page__block-label">Объект капитального строительства:</p>
              <p className="act-page__field-line act-page__object-line">
                {objectDefaults.objectName}
              </p>
              <p className="act-page__caption">
                (наименование объекта капитального строительства в соответствии с проектной
                документацией, адрес объекта)
              </p>
            </div>

            {objectDefaults.headerOrganizations.map((headerOrganization) => (
              <div className="act-page__header-block" key={headerOrganization.id}>
                <p className="act-page__block-label">{headerOrganization.label}:</p>
                <p className="act-page__field-line">{headerOrganization.organizationName}</p>
                <p className="act-page__field-line act-page__details-line">
                  {headerOrganization.details}
                </p>
                {headerOrganization.caption ? (
                  <p className="act-page__caption">({headerOrganization.caption})</p>
                ) : null}
              </div>
            ))}
          </header>

          <section className="act-page__title-block">
            <p>АКТ</p>
            <h3>ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ</h3>
            <div className="act-page__number-date-row">
              <span>
                <strong>№ {selectedDraft.actNumber}</strong>
              </span>
              <span>
                <strong>{formatDocumentDate(selectedDraft.actDate)}</strong>
              </span>
            </div>
          </section>

          <section className="act-page__representative-blocks" aria-label="Представители">
            {selectedSignatories.map((representative) => (
              <div className="act-page__representative-block" key={representative.id}>
                <p className="act-page__block-label">{representative.roleLabel}:</p>
                <p className="act-page__field-line">
                  {getRepresentativePreviewLine(representative)}
                </p>
                <p className="act-page__field-line act-page__details-line">
                  {getRepresentativeAuthorityLine(representative)}
                </p>
                <p className="act-page__caption">
                  (должность, фамилия, инициалы, идентификационный номер в НРС, реквизиты документа,
                  подтверждающего полномочия)
                </p>
              </div>
            ))}
            <p>
              произвели осмотр работ, выполненных{' '}
              <span className="act-page__print-value">{executingOrganization}</span>
            </p>
            <p className="act-page__caption">
              (наименование лица, выполнившего работы, подлежащие освидетельствованию)
            </p>
            <p>и составили настоящий акт о нижеследующем:</p>
          </section>

          <section className="act-page__official-section" aria-label="Скрытые работы">
            <p>
              <span className="act-page__item-label">
                1. К освидетельствованию предъявлены следующие работы:
              </span>{' '}
              <span className="act-page__print-value">
                {getHiddenWorksPreviewLine(selectedDraft)}
              </span>
            </p>
            <p className="act-page__caption">(наименование скрытых работ)</p>
          </section>

          <section className="act-page__official-section" aria-label="Проектная документация">
            <p>
              <span className="act-page__item-label">
                2. Работы выполнены по проектной документации:
              </span>{' '}
              <span className="act-page__print-value">
                {objectDefaults.defaultProjectDocumentation}
              </span>
            </p>
            <p className="act-page__caption">
              (номер, другие реквизиты чертежа, наименование проектной и рабочей документации)
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Материалы и сертификаты">
            <p>
              <span className="act-page__item-label">3. При выполнении работ применены:</span>
            </p>
            {selectedMaterials.length > 0 ? (
              <div className="act-page__inline-list">
                {selectedMaterials.map((certificate) => (
                  <p key={certificate.id}>
                    <span className="act-page__print-value">
                      {certificate.materialName} ({certificate.documentName},{' '}
                      {certificate.certificateNumber})
                    </span>
                  </p>
                ))}
              </div>
            ) : (
              <p>Материалы из демо-библиотеки сертификатов не выбраны.</p>
            )}
            <p className="act-page__caption">
              (наименование материалов и реквизиты документов, подтверждающих качество)
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Документы соответствия">
            <p>
              <span className="act-page__item-label">
                4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним
                требованиям:
              </span>
            </p>
            {selectedObjectDocuments.length > 0 ? (
              <div className="act-page__inline-list">
                {selectedObjectDocuments.map((document) => (
                  <p key={document.id}>
                    <span className="act-page__print-value">
                      {document.title} {document.reference}
                    </span>
                  </p>
                ))}
              </div>
            ) : (
              <p>Документы объекта для пункта 4 пока не выбраны.</p>
            )}
            <p className="act-page__caption">
              (исполнительные схемы, результаты обследований, журналы и иные материалы)
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Период работ">
            <p>
              <span className="act-page__item-label">5. Даты:</span>
            </p>
            <p>
              начала работ{' '}
              <span className="act-page__print-value">
                {formatDocumentDate(selectedDraft.periodStart)}
              </span>
            </p>
            <p>
              окончания работ{' '}
              <span className="act-page__print-value">
                {formatDocumentDate(selectedDraft.periodEnd)}
              </span>
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Соответствие работ">
            <p>
              <span className="act-page__item-label">6. Работы выполнены в соответствии с:</span>{' '}
              <span className="act-page__print-value">{complianceStatement}</span>
            </p>
            <p className="act-page__caption">
              (наименования технических регламентов, норм и разделов проектной документации)
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Последующие работы">
            <p>
              <span className="act-page__item-label">
                7. Разрешается производство последующих работ по:
              </span>{' '}
              <span className="act-page__print-value">
                {selectedDraft.subsequentWorksPermitted}
              </span>
            </p>
            <p className="act-page__caption">(наименование работ, конструкций и участков сетей)</p>
          </section>

          <section className="act-page__after-body" aria-label="Сведения и приложения">
            <p>
              <span className="act-page__item-label">Дополнительные сведения:</span>{' '}
              <span className="act-page__print-value">{selectedDraft.additionalInfo}</span>
            </p>
            <p>
              Акт составлен в{' '}
              <span className="act-page__print-value">{selectedDraft.copiesCount}</span>{' '}
              экземплярах.
            </p>
            <div className="act-page__applications">
              <h4>Приложения:</h4>
              <div className="act-page__application-lines">
                {finalApplications.length > 0 ? (
                  finalApplications.map((application) => {
                    const sourceLabel = getApplicationPrintSourceLabel(application);

                    return (
                      <p key={application.id}>
                        <span className="act-page__print-value">
                          {application.title}
                          {sourceLabel}
                        </span>
                      </p>
                    );
                  })
                ) : (
                  <p>
                    <span className="act-page__print-value">Приложения не включены.</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            className="act-page__signature-section act-page__official-section--final"
            aria-label="Подписи представителей"
          >
            <div className="act-page__signature-table">
              {selectedSignatories.map((representative) => (
                <div className="act-page__signature-block" key={representative.id}>
                  <p className="act-page__block-label">{representative.roleLabel}:</p>
                  <div className="act-page__signature-person-row">
                    <span className="act-page__signature-person">
                      {representative.position} {representative.organization}{' '}
                      {representative.fullName}
                    </span>
                    <span className="act-page__signature-line" aria-hidden="true" />
                  </div>
                  <div className="act-page__signature-caption-row">
                    <span>(фамилия, инициалы)</span>
                    <span>(подпись)</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </section>
  );
}

function getApplicationPrintSourceLabel(application: DemoActApplication): string {
  return application.source === 'Сертификат / материал' ? '' : ` ${application.source}`;
}

function getHiddenWorksPreviewLine(selectedDraft: DemoAosrDraft): string {
  return [selectedDraft.workDescription, selectedDraft.axes, selectedDraft.elevationRange]
    .map((value) => value.trim())
    .filter(Boolean)
    .join('; ');
}

function getExecutingOrganization(
  selectedSignatories: readonly DemoAosrRepresentative[],
  objectDefaults: DemoAosrObjectDefaults,
): string {
  const lastSignatory = selectedSignatories[selectedSignatories.length - 1];
  const contractorHeader = objectDefaults.headerOrganizations.find(({ label }) =>
    label.toLocaleLowerCase('ru-RU').includes('подряд'),
  );
  const lastHeaderOrganization =
    objectDefaults.headerOrganizations[objectDefaults.headerOrganizations.length - 1];

  return (
    contractorHeader?.organizationName ??
    lastSignatory?.organization ??
    lastHeaderOrganization?.organizationName ??
    'организацией, указанной в настройках объекта'
  );
}
