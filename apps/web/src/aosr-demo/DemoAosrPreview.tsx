import { useEffect, useRef, useState } from 'react';

import { generateAosrDocxBlob } from './aosr-docx-generator.js';
import type { AosrPrintState } from './demo-aosr-workspace.js';

interface DemoAosrPreviewProps {
  readonly printState: AosrPrintState;
}

type AosrPreviewStatus = 'error' | 'loading' | 'ready';

export function DemoAosrPreview({ printState }: DemoAosrPreviewProps): React.JSX.Element {
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
    const detachedPreviewHost = document.createElement('div');

    const renderPreview = async (): Promise<void> => {
      try {
        const docxBlob = await generateAosrDocxBlob(printState);
        const { renderAsync } = await import('docx-preview');

        if (previewRenderIdRef.current !== renderId) {
          return;
        }

        await renderAsync(docxBlob, detachedPreviewHost, detachedPreviewHost, {
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

        if (previewRenderIdRef.current !== renderId) {
          return;
        }

        previewHost.replaceChildren(...Array.from(detachedPreviewHost.childNodes));
        setPreviewStatus('ready');
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
