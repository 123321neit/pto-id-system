import { useEffect, useRef, useState } from 'react';

import type { DemoAosrFormVariantMetadata } from '../act-types/act-types.js';
import { buildAosrDocxTemplateData } from './aosr-docx-template-data.js';
import { generateAosrDocxBlob } from './aosr-docx-generator.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

const objectNameCaption =
  '(наименование объекта капитального строительства в соответствии с проектной документацией, почтовый или строительный адрес объекта капитального строительства)';
const workContractorCaption =
  '(полное и (или) сокращенное наименование или фамилия, имя, отчество (последнее – при наличии) лица, выполнившего работы, подлежащие освидетельствованию)';
const projectDocumentationCaption =
  '(номер, другие реквизиты чертежа, наименование проектной и (или) рабочей документации, сведения о лицах, осуществляющих подготовку раздела проектной и (или) рабочей документации)';
const materialsCaption =
  '(наименование строительных материалов (изделий), реквизиты сертификатов и (или) других документов, подтверждающих их качество и безопасность, в случае если необходимо указывать более 5 документов, указывается ссылка на их реестр, который является неотъемлемой частью акта)';
const confirmationDocumentsCaption =
  '(исполнительные схемы и чертежи, результаты экспертиз, обследований, лабораторных и иных испытаний выполненных работ, проведенных в процессе строительного контроля)';
const complianceCaption =
  '(наименования и структурные единицы технических регламентов, иных нормативных правовых актов, разделы проектной и (или) рабочей документации)';
const nextWorksCaption =
  '(наименование работ, строительных конструкций, участков сетей инженерно-технического обеспечения)';
const applicationsCaption =
  '(исполнительные схемы и чертежи, результаты экспертиз, обследований, лабораторных и иных испытаний)';
const signatureCaption = '(должность, фамилия, инициалы, подпись)';

interface DemoAosrPreviewProps {
  readonly formVariant: DemoAosrFormVariantMetadata;
  readonly printState: AosrPrintState;
}

type AosrPreviewStatus = 'error' | 'loading' | 'ready';

export function DemoAosrPreview({
  formVariant,
  printState,
}: DemoAosrPreviewProps): React.JSX.Element {
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const previewRenderIdRef = useRef(0);
  const [previewStatus, setPreviewStatus] = useState<AosrPreviewStatus>('loading');
  const templateData = buildAosrDocxTemplateData(printState);
  const shouldShowHtmlPreview = previewStatus !== 'ready' || import.meta.env.MODE === 'test';

  useEffect(() => {
    const previewHost = previewHostRef.current;

    if (previewHost === null) {
      return undefined;
    }

    previewHost.replaceChildren();
    setPreviewStatus('loading');
    const renderId = previewRenderIdRef.current + 1;
    previewRenderIdRef.current = renderId;

    if (import.meta.env.MODE === 'test') {
      previewHost.dataset['testDocxPreview'] = 'skipped';
      setPreviewStatus('ready');

      return undefined;
    }

    const renderPreview = async (): Promise<void> => {
      try {
        const docxBlob = await generateAosrDocxBlob(printState);
        const { renderAsync } = await import('docx-preview');

        if (previewRenderIdRef.current !== renderId) {
          return;
        }

        await renderAsync(docxBlob, previewHost, previewHost, {
          breakPages: true,
          className: 'aosr-docx',
          experimental: true,
          ignoreFonts: false,
          ignoreHeight: false,
          ignoreLastRenderedPageBreak: false,
          ignoreWidth: false,
          inWrapper: true,
          renderFooters: true,
          renderHeaders: true,
          useBase64URL: true,
        });

        if (previewRenderIdRef.current === renderId) {
          setPreviewStatus('ready');
        }
      } catch (error) {
        console.error('AOSR DOCX preview rendering failed', error);

        if (previewRenderIdRef.current === renderId) {
          previewHost.replaceChildren();
          setPreviewStatus('error');
        }
      }
    };

    void renderPreview();

    return () => {
      previewRenderIdRef.current += 1;
      previewHost.replaceChildren();
    };
  }, [printState]);

  return (
    <section className="preview-panel preview-panel--template" aria-labelledby="preview-title">
      <div className="panel-heading">
        <h2 id="preview-title">Предпросмотр АОСР</h2>
        <p>
          Предпросмотр строится из того же DOCX-шаблона, что и скачиваемый файл. Если поле не
          заполнено, в акте останется пустая строка без видимых тегов.
        </p>
      </div>
      <div className="aosr-docx-preview-shell" data-status={previewStatus}>
        {previewStatus === 'loading' ? (
          <p className="aosr-docx-preview-status" role="status">
            Готовим предпросмотр из DOCX-шаблона…
          </p>
        ) : null}
        {previewStatus === 'error' ? (
          <div className="aosr-docx-preview-error" role="alert">
            Не удалось показать предпросмотр DOCX. Скачивание акта остаётся доступным — проверьте
            шаблон и данные документа.
          </div>
        ) : null}
        <div
          ref={previewHostRef}
          className="aosr-docx-preview-host"
          aria-label="Предпросмотр DOCX-шаблона АОСР"
        />
      </div>
      <article
        className="act-page"
        aria-label="Демо-предпросмотр печатной формы АОСР"
        hidden={!shouldShowHtmlPreview}
      >
        <section className="act-page__page-frame" aria-labelledby="aosr-preview-page-1-label">
          <p className="act-page__page-label" id="aosr-preview-page-1-label">
            Страница 1
          </p>
          <div className="act-page__sheet">
            <header className="act-page__top-blocks">
              <div className="act-page__header-block">
                <p className="act-page__block-label">Объект капитального строительства:</p>
                <p className="act-page__field-line act-page__object-line">
                  {templateData.object.name}
                </p>
                <p className="act-page__caption">{objectNameCaption}</p>
              </div>

              {templateData.counterparties.map((counterparty, index) => (
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
                  <strong>{templateData.document.numberLine}</strong>
                </span>
                <span>
                  <strong>{templateData.document.dateLine}</strong>
                </span>
              </div>
            </section>

            <section className="act-page__representative-blocks" aria-label="Представители">
              {templateData.representatives.groups.map((group, groupIndex) => (
                <div
                  className="act-page__representative-block"
                  key={`${group.title}-${String(groupIndex)}`}
                >
                  <p className="act-page__block-label">{group.title}:</p>
                  {group.members.map((member, memberIndex) => {
                    const subscript = getDistinctRepresentativeSubscript(
                      member.introDisplayText,
                      member.subscript,
                    );

                    return (
                      <div key={`${member.introDisplayText}-${String(memberIndex)}`}>
                        <p className="act-page__field-line">{member.introDisplayText}</p>
                        {subscript === '' ? null : (
                          <p className="act-page__caption">({subscript})</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <p>
                произвели осмотр работ, выполненных{' '}
                <span className="act-page__print-value">{templateData.work.contractorName}</span>
              </p>
              <p className="act-page__caption">{workContractorCaption}</p>
              <p>и составили настоящий акт о нижеследующем:</p>
            </section>

            <section className="act-page__official-section" aria-label="Скрытые работы">
              <p>
                <span className="act-page__item-label">
                  1.К освидетельствованию предъявлены следующие работы:
                </span>{' '}
                <span className="act-page__print-value">{templateData.work.description}</span>
              </p>
              <p className="act-page__caption">(наименование скрытых работ)</p>
            </section>

            <section className="act-page__official-section" aria-label="Проектная документация">
              <p>
                <span className="act-page__item-label">
                  2.Работы выполнены по проектной документации:
                </span>{' '}
                <span className="act-page__print-value">{templateData.project.documentation}</span>
              </p>
              <p className="act-page__caption">{projectDocumentationCaption}</p>
            </section>

            <section className="act-page__official-section" aria-label="Материалы и сертификаты">
              <p>
                <span className="act-page__item-label">3.При выполнении работ применены:</span>
              </p>
              {templateData.materials.items.length > 0 ? (
                <div className="act-page__inline-list">
                  {templateData.materials.items.map((material, index) => (
                    <p key={`${material.displayText}-${String(index)}`}>
                      <span className="act-page__print-value">{material.displayText}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="act-page__field-line" aria-label="Материалы не указаны" />
              )}
              <p className="act-page__caption">{materialsCaption}</p>
            </section>

            <section className="act-page__official-section" aria-label="Документы соответствия">
              <p>
                <span className="act-page__item-label">
                  4.Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним
                  требованиям:
                </span>
              </p>
              {templateData.confirmationDocuments.items.length > 0 ? (
                <div className="act-page__inline-list">
                  {templateData.confirmationDocuments.items.map((document, index) => (
                    <p key={`${document.displayText}-${String(index)}`}>
                      <span className="act-page__print-value">{document.displayText}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="act-page__field-line" aria-label="Документы не указаны" />
              )}
              <p className="act-page__caption">{confirmationDocumentsCaption}</p>
            </section>

            <section className="act-page__official-section" aria-label="Период работ">
              <p>
                <span className="act-page__item-label">5.Даты:</span>
              </p>
              <p>
                начала работ{' '}
                <span className="act-page__print-value">{templateData.work.startDateLine}</span>
              </p>
              <p>
                окончания работ{' '}
                <span className="act-page__print-value">{templateData.work.endDateLine}</span>
              </p>
            </section>
            <section className="act-page__official-section" aria-label="Соответствие работ">
              <p>
                <span className="act-page__item-label">6.Работы выполнены в соответствии с:</span>{' '}
                <span className="act-page__print-value">{templateData.project.compliance}</span>
              </p>
              <p className="act-page__caption">{complianceCaption}</p>
            </section>

            <section className="act-page__official-section" aria-label="Последующие работы">
              <p>
                <span className="act-page__item-label">
                  7.Разрешается производство последующих работ по:
                </span>{' '}
                <span className="act-page__print-value">{templateData.work.nextWorks}</span>
              </p>
              <p className="act-page__caption">{nextWorksCaption}</p>
            </section>

            <section className="act-page__after-body" aria-label="Сведения и приложения">
              <p>
                <span className="act-page__item-label">Дополнительные сведения:</span>{' '}
                <span className="act-page__print-value">
                  {templateData.document.additionalInfo}
                </span>
              </p>
              <p>
                Акт составлен в{' '}
                <span className="act-page__print-value">{templateData.document.copiesLine}</span>{' '}
                экземплярах.
              </p>
              <div className="act-page__applications">
                <h4>Приложения:</h4>
                <div className="act-page__application-lines">
                  {templateData.applications.items.length > 0 ? (
                    templateData.applications.items.map((application, index) => {
                      return (
                        <p key={`${application.displayText}-${String(index)}`}>
                          <span className="act-page__print-value">{application.displayText}</span>
                        </p>
                      );
                    })
                  ) : (
                    <p className="act-page__field-line" aria-label="Приложения не указаны" />
                  )}
                </div>
                <p className="act-page__caption">{applicationsCaption}</p>
              </div>
            </section>

            <section
              className="act-page__signature-section act-page__official-section--final"
              aria-label="Подписи представителей"
            >
              <div className="act-page__signature-list">
                {templateData.representatives.groups.map((group, groupIndex) => (
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
                        <p className="act-page__signature-line-row">
                          <span className="act-page__signature-person">{member.signatureText}</span>
                          <span className="act-page__signature-name">{member.signatureName}</span>
                        </p>
                        <p className="act-page__caption act-page__signature-caption">
                          {signatureCaption}
                        </p>
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

function getDistinctRepresentativeSubscript(introDisplayText: string, subscript: string): string {
  const normalizedIntro = introDisplayText.trim().replace(/\s+/gu, ' ');
  const normalizedSubscript = subscript.trim().replace(/\s+/gu, ' ');

  return normalizedSubscript === normalizedIntro ? '' : subscript.trim();
}
