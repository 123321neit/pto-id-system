import { useEffect, useRef, useState } from 'react';

import { buildAosrDocxTemplateData } from './aosr-docx-template-data.js';
import { generateAosrDocxBlob } from './aosr-docx-generator.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

interface DemoAosrPreviewProps {
  readonly printState: AosrPrintState;
  readonly testOnlyPreviewStatus?: AosrPreviewStatus;
}

type AosrPreviewStatus = 'error' | 'loading' | 'ready';

export function DemoAosrPreview({
  printState,
  testOnlyPreviewStatus,
}: DemoAosrPreviewProps): React.JSX.Element {
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const previewRenderIdRef = useRef(0);
  const [previewStatus, setPreviewStatus] = useState<AosrPreviewStatus>('loading');

  useEffect(() => {
    const previewHost = previewHostRef.current;

    if (previewHost === null) {
      return undefined;
    }

    previewHost.replaceChildren();
    setPreviewStatus('loading');
    const renderId = previewRenderIdRef.current + 1;
    previewRenderIdRef.current = renderId;

    if (testOnlyPreviewStatus !== undefined) {
      previewHost.dataset['testDocxPreview'] = testOnlyPreviewStatus;
      setPreviewStatus(testOnlyPreviewStatus);

      return undefined;
    }

    if (import.meta.env.MODE === 'test') {
      previewHost.dataset['testDocxPreview'] = 'skipped';
      previewHost.dataset['testDocxTemplateText'] = buildTestDocxTemplateText(printState);
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
  }, [printState, testOnlyPreviewStatus]);

  return (
    <section className="preview-panel preview-panel--template" aria-labelledby="preview-title">
      <div className="panel-heading">
        <h2 id="preview-title">Предпросмотр АОСР</h2>
        <p>
          Предпросмотр строится из реально сгенерированного DOCX на том же шаблоне, что и
          скачиваемый файл. Если предпросмотр не загрузился, скачайте DOCX и проверьте его в Word.
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
            Не удалось показать предпросмотр DOCX. Скачайте DOCX и проверьте файл.
          </div>
        ) : null}
        <div
          ref={previewHostRef}
          className="aosr-docx-preview-host"
          aria-label="Предпросмотр DOCX-шаблона АОСР"
        />
      </div>
    </section>
  );
}

function buildTestDocxTemplateText(printState: AosrPrintState): string {
  const templateData = buildAosrDocxTemplateData(printState);
  const textParts = [
    'Объект капитального строительства:',
    templateData.object.name,
    ...templateData.counterparties.flatMap((counterparty) => [
      `${counterparty.title}:`,
      counterparty.displayText,
      counterparty.subscript === '' ? '' : `(${counterparty.subscript})`,
    ]),
    'ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ',
    templateData.document.numberLine,
    templateData.document.dateLine,
    ...templateData.representatives.groups.flatMap((group) => [
      `${group.title}:`,
      ...group.members.flatMap((member) => [
        member.introDisplayText,
        member.subscript === '' ? '' : `(${member.subscript})`,
        member.signatureText,
        member.signatureName,
      ]),
    ]),
    'произвели осмотр работ',
    templateData.work.contractorName,
    'и составили настоящий акт о нижеследующем:',
    '1.К освидетельствованию предъявлены следующие работы:',
    templateData.work.description,
    '2.Работы выполнены по проектной документации:',
    templateData.project.documentation,
    '3.При выполнении работ применены:',
    ...templateData.materials.items.map((material) => material.displayText),
    '4.Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним требованиям:',
    ...templateData.confirmationDocuments.items.map((document) => document.displayText),
    '5.Даты:',
    templateData.work.startDateLine,
    templateData.work.endDateLine,
    '6.Работы выполнены в соответствии с:',
    templateData.project.compliance,
    '7.Разрешается производство последующих работ по:',
    templateData.work.nextWorks,
    'Дополнительные сведения:',
    templateData.document.additionalInfo,
    `Акт составлен в ${templateData.document.copiesLine} экземплярах.`,
    'Приложения:',
    ...templateData.applications.items.map((application) => application.displayText),
  ];

  return textParts
    .map((textPart) => textPart.trim())
    .filter((textPart) => textPart !== '')
    .join('\n');
}
