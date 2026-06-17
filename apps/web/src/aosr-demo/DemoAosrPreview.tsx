import type { DemoAosrFormVariantMetadata } from '../act-types/act-types.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';
import { formatDocumentDate } from './demo-aosr-ui.js';

interface DemoAosrPreviewProps {
  readonly formVariant: DemoAosrFormVariantMetadata;
  readonly printState: AosrPrintState;
}

export function DemoAosrPreview({
  formVariant,
  printState,
}: DemoAosrPreviewProps): React.JSX.Element {
  return (
    <section className="preview-panel" aria-labelledby="preview-title">
      <div className="panel-heading">
        <h2 id="preview-title">Предпросмотр АОСР</h2>
      </div>
      <article className="act-page" aria-label="Демо-предпросмотр печатной формы АОСР">
        <section className="act-page__page-frame" aria-labelledby="aosr-preview-page-1-label">
          <p className="act-page__page-label" id="aosr-preview-page-1-label">
            Страница 1
          </p>
          <div className="act-page__sheet">
            <header className="act-page__top-blocks">
              <div className="act-page__header-block">
                <p className="act-page__block-label">Объект капитального строительства:</p>
                <p className="act-page__field-line act-page__object-line">
                  {printState.object.name}
                </p>
                <p className="act-page__caption">({printState.object.nameSubscript})</p>
              </div>

              {printState.counterparties.map((counterparty, index) => (
                <div
                  className="act-page__header-block"
                  key={`${counterparty.title}-${String(index)}`}
                >
                  <p className="act-page__block-label">{counterparty.title}:</p>
                  <p className="act-page__field-line act-page__details-line">
                    {counterparty.displayText}
                  </p>
                  {counterparty.subscript ? (
                    <p className="act-page__caption">({counterparty.subscript})</p>
                  ) : null}
                </div>
              ))}
            </header>

            <section className="act-page__title-block">
              <p>АКТ</p>
              <h3>{formVariant.printTitle}</h3>
              <div className="act-page__number-date-row">
                <span>
                  <strong>№ {printState.document.number}</strong>
                </span>
                <span>
                  <strong>{formatDocumentDate(printState.document.date)}</strong>
                </span>
              </div>
              {printState.document.underTitleText.trim() === '' ? null : (
                <p className="act-page__under-title-text">{printState.document.underTitleText}</p>
              )}
            </section>

            <section className="act-page__representative-blocks" aria-label="Представители">
              {printState.representatives.groups.map((group, groupIndex) => (
                <div
                  className="act-page__representative-block"
                  key={`${group.title}-${String(groupIndex)}`}
                >
                  <p className="act-page__block-label">{group.title}:</p>
                  {group.members.map((member, memberIndex) => (
                    <div key={`${member.introDisplayText}-${String(memberIndex)}`}>
                      <p className="act-page__field-line">{member.introDisplayText}</p>
                      <p className="act-page__field-line act-page__details-line">
                        {member.subscript}
                      </p>
                      <p className="act-page__caption">
                        (должность, фамилия, инициалы, идентификационный номер в НРС, реквизиты
                        документа, подтверждающего полномочия)
                      </p>
                    </div>
                  ))}
                </div>
              ))}
              <p>
                произвели осмотр работ, выполненных{' '}
                <span className="act-page__print-value">{printState.work.contractorName}</span>
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
                <span className="act-page__print-value">{printState.work.description}</span>
              </p>
              <p className="act-page__caption">(наименование скрытых работ)</p>
            </section>

            <section className="act-page__official-section" aria-label="Проектная документация">
              <p>
                <span className="act-page__item-label">
                  2. Работы выполнены по проектной документации:
                </span>{' '}
                <span className="act-page__print-value">{printState.project.documentation}</span>
              </p>
              <p className="act-page__caption">
                (номер, другие реквизиты чертежа, наименование проектной и рабочей документации)
              </p>
            </section>

            <section className="act-page__official-section" aria-label="Материалы и сертификаты">
              <p>
                <span className="act-page__item-label">3. При выполнении работ применены:</span>
              </p>
              {printState.materials.items.length > 0 ? (
                <div className="act-page__inline-list">
                  {printState.materials.items.map((material, index) => (
                    <p key={`${material.displayText}-${String(index)}`}>
                      <span className="act-page__print-value">{material.displayText}</span>
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
              {printState.confirmationDocuments.items.length > 0 ? (
                <div className="act-page__inline-list">
                  {printState.confirmationDocuments.items.map((document, index) => (
                    <p key={`${document.displayText}-${String(index)}`}>
                      <span className="act-page__print-value">{document.displayText}</span>
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
                  {formatDocumentDate(printState.work.startDateLine)}
                </span>
              </p>
              <p>
                окончания работ{' '}
                <span className="act-page__print-value">
                  {formatDocumentDate(printState.work.endDateLine)}
                </span>
              </p>
            </section>
          </div>
        </section>

        <div className="act-page__page-break" aria-hidden="true" />

        <section className="act-page__page-frame" aria-labelledby="aosr-preview-page-2-label">
          <p className="act-page__page-label" id="aosr-preview-page-2-label">
            Страница 2
          </p>
          <div className="act-page__sheet">
            <section className="act-page__official-section" aria-label="Соответствие работ">
              <p>
                <span className="act-page__item-label">6. Работы выполнены в соответствии с:</span>{' '}
                <span className="act-page__print-value">{printState.project.compliance}</span>
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
                <span className="act-page__print-value">{printState.work.nextWorks}</span>
              </p>
              <p className="act-page__caption">
                (наименование работ, конструкций и участков сетей)
              </p>
            </section>

            <section className="act-page__after-body" aria-label="Сведения и приложения">
              <p>
                <span className="act-page__item-label">Дополнительные сведения:</span>{' '}
                <span className="act-page__print-value">{printState.document.additionalInfo}</span>
              </p>
              <p>
                Акт составлен в{' '}
                <span className="act-page__print-value">{printState.document.copiesLine}</span>{' '}
                экземплярах.
              </p>
              <div className="act-page__applications">
                <h4>Приложения:</h4>
                <div className="act-page__application-lines">
                  {printState.applications.items.length > 0 ? (
                    printState.applications.items.map((application, index) => {
                      return (
                        <p key={`${application.displayText}-${String(index)}`}>
                          <span className="act-page__print-value">{application.displayText}</span>
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
                {printState.representatives.groups.map((group, groupIndex) => (
                  <div
                    className="act-page__signature-block"
                    key={`${group.title}-signature-${String(groupIndex)}`}
                  >
                    <p className="act-page__block-label">{group.title}:</p>
                    {group.members.map((member, memberIndex) => (
                      <div
                        className="act-page__signature-member"
                        key={`${member.signatureText}-${member.signatureName}-${String(
                          memberIndex,
                        )}`}
                      >
                        <div className="act-page__signature-person-row">
                          <span className="act-page__signature-person">
                            {member.signatureText} {member.signatureName}
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
                ))}
              </div>
            </section>
          </div>
        </section>
      </article>
    </section>
  );
}
