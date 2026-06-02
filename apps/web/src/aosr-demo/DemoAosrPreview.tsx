import type {
  DemoActApplication,
  DemoAosrDraft,
  DemoAosrObjectDefaults,
  DemoAosrRepresentative,
  DemoDerivedAttachment,
  DemoMaterialCertificate,
} from './demo-aosr-workspace.js';
import {
  formatDocumentDate,
  getRepresentativeAuthorityLine,
  getRepresentativePreviewLine,
} from './demo-aosr-ui.js';

interface DemoAosrPreviewProps {
  readonly demoNotice: string;
  readonly finalApplications: readonly DemoActApplication[];
  readonly objectDefaults: DemoAosrObjectDefaults;
  readonly selectedDerivedAttachments: readonly DemoDerivedAttachment[];
  readonly selectedDraft: DemoAosrDraft;
  readonly selectedMaterials: readonly DemoMaterialCertificate[];
  readonly selectedSignatories: readonly DemoAosrRepresentative[];
}

export function DemoAosrPreview({
  demoNotice,
  finalApplications,
  objectDefaults,
  selectedDerivedAttachments,
  selectedDraft,
  selectedMaterials,
  selectedSignatories,
}: DemoAosrPreviewProps): React.JSX.Element {
  const executingOrganization = getExecutingOrganization(selectedSignatories, objectDefaults);

  return (
    <section className="preview-panel" aria-labelledby="preview-title">
      <div className="panel-heading">
        <p className="section-kicker">HTML-макет печатной формы</p>
        <h2 id="preview-title">Предпросмотр АОСР</h2>
      </div>
      <article className="act-page" aria-label="Демо-предпросмотр печатной формы АОСР">
        <div className="act-page__sheet">
          <div className="act-page__notice-row">
            <span className="act-page__demo-label">{demoNotice}</span>
            <span className="act-page__placeholder">
              Позже здесь будет реальный PDF/печатная форма акта
            </span>
          </div>

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
              <span>{selectedDraft.actPlace}</span>
              <strong>№ {selectedDraft.actNumber}</strong>
              <span>{formatDocumentDate(selectedDraft.actDate)}</span>
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
            <p>произвели осмотр работ, выполненных {executingOrganization}</p>
            <p className="act-page__caption">
              (наименование лица, выполнившего работы, подлежащие освидетельствованию)
            </p>
            <p>и составили настоящий акт о нижеследующем:</p>
          </section>

          <section className="act-page__official-section" aria-label="Скрытые работы">
            <p>
              <strong>1. К освидетельствованию предъявлены следующие работы:</strong>{' '}
              {selectedDraft.workDescription}
            </p>
            <p className="act-page__caption">(наименование скрытых работ)</p>
          </section>

          <section className="act-page__official-section" aria-label="Проектная документация">
            <p>
              <strong>2. Работы выполнены по проектной документации:</strong>{' '}
              {objectDefaults.defaultProjectDocumentation}
            </p>
            <p className="act-page__caption">
              (номер, другие реквизиты чертежа, наименование проектной и рабочей документации)
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Материалы и сертификаты">
            <p>
              <strong>3. При выполнении работ применены:</strong>
            </p>
            {selectedMaterials.length > 0 ? (
              <div className="act-page__inline-list">
                {selectedMaterials.map((certificate) => (
                  <p key={certificate.id}>
                    <em>
                      {certificate.materialName} ({certificate.documentName},{' '}
                      {certificate.certificateNumber})
                    </em>
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
              <strong>
                4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним
                требованиям:
              </strong>
            </p>
            {selectedDerivedAttachments.length > 0 ? (
              <div className="act-page__inline-list">
                {selectedDerivedAttachments.map((attachment) => (
                  <p key={attachment.id}>
                    <em>
                      {attachment.title} {attachment.reference}
                    </em>
                  </p>
                ))}
              </div>
            ) : (
              <p>Исполнительные схемы, фото и журнальные записи пока не выбраны.</p>
            )}
            <p className="act-page__caption">
              (исполнительные схемы, результаты обследований, журналы и иные материалы)
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Период работ">
            <p>
              <strong>5. Даты:</strong>
            </p>
            <dl className="act-page__date-lines">
              <div>
                <dt>начала работ</dt>
                <dd>{formatDocumentDate(selectedDraft.periodStart)}</dd>
              </div>
              <div>
                <dt>окончания работ</dt>
                <dd>{formatDocumentDate(selectedDraft.periodEnd)}</dd>
              </div>
            </dl>
          </section>

          <section className="act-page__official-section" aria-label="Соответствие работ">
            <p>
              <strong>6. Работы выполнены в соответствии с:</strong>{' '}
              {selectedDraft.complianceStatement}
            </p>
            <p className="act-page__caption">
              (наименования технических регламентов, норм и разделов проектной документации)
            </p>
          </section>

          <section className="act-page__official-section" aria-label="Последующие работы">
            <p>
              <strong>7. Разрешается производство последующих работ по:</strong>{' '}
              {selectedDraft.subsequentWorksPermitted}
            </p>
            <p className="act-page__caption">(наименование работ, конструкций и участков сетей)</p>
          </section>

          <section className="act-page__after-body" aria-label="Сведения и приложения">
            <p>
              <strong>Дополнительные сведения:</strong> {selectedDraft.additionalInfo}
            </p>
            <p>Акт составлен в {selectedDraft.copiesCount} экземплярах.</p>
            <div className="act-page__applications">
              <h4>Приложения:</h4>
              <ol className="act-page__ordered-list">
                {finalApplications.map((application) => (
                  <li key={application.id}>
                    <span>{application.title}</span>
                    <strong>{application.source}</strong>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section
            className="act-page__signature-section act-page__official-section--final"
            aria-label="Подписи представителей"
          >
            <h4>Подписи представителей</h4>
            <div className="act-page__signature-table">
              {selectedSignatories.map((representative) => (
                <div className="act-page__signature-block" key={representative.id}>
                  <p>{representative.roleLabel}:</p>
                  <div className="act-page__signature-row">
                    <span>
                      {representative.position} {representative.organization}
                    </span>
                    <strong>{representative.fullName}</strong>
                    <span className="act-page__signature-line">подпись</span>
                  </div>
                  <div className="act-page__signature-caption-row">
                    <span>(должность, организация)</span>
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
    lastSignatory?.organization ??
    contractorHeader?.organizationName ??
    lastHeaderOrganization?.organizationName ??
    'организацией, указанной в настройках объекта'
  );
}
