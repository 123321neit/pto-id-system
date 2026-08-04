import { useEffect, useRef, useState } from 'react';

import type { AiDocumentationScope } from './object-workspace-ai.js';

interface AiDocumentationAssistantProps {
  readonly folderName?: string | undefined;
  readonly initialScope: AiDocumentationScope;
  readonly onClose: () => void;
  readonly onPrepare: (scope: AiDocumentationScope) => void;
  readonly sectionFolderCount: number;
  readonly sectionName: string;
}

export function AiDocumentationAssistant({
  folderName,
  initialScope,
  onClose,
  onPrepare,
  sectionFolderCount,
  sectionName,
}: AiDocumentationAssistantProps): React.JSX.Element {
  const [scope, setScope] = useState<AiDocumentationScope>(
    folderName === undefined ? 'section' : initialScope,
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    closeButtonRef.current?.focus();
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="ai-documentation-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-labelledby="ai-documentation-title"
        aria-modal="true"
        className="ai-documentation-dialog"
        role="dialog"
      >
        <button
          aria-label="Закрыть ИИ-помощник"
          className="ai-documentation-dialog__close"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>
        <span className="ai-documentation-dialog__icon" aria-hidden="true">
          <SparklesIcon />
        </span>
        <div className="ai-documentation-dialog__heading">
          <p className="section-kicker">ИИ-ПОМОЩНИК</p>
          <h2 id="ai-documentation-title">Сделать ИД с ИИ</h2>
          <p>
            Помощник создаст редактируемые черновики на основе данных объекта и шаблона раздела.
          </p>
        </div>

        <fieldset className="ai-documentation-scope">
          <legend>Где подготовить документы</legend>
          {folderName === undefined ? null : (
            <label className={scope === 'folder' ? 'is-selected' : undefined}>
              <input
                checked={scope === 'folder'}
                name="ai-documentation-scope"
                onChange={() => {
                  setScope('folder');
                }}
                type="radio"
              />
              <span>
                <strong>В этой папке</strong>
                <small>{folderName}</small>
              </span>
            </label>
          )}
          <label className={scope === 'section' ? 'is-selected' : undefined}>
            <input
              checked={scope === 'section'}
              name="ai-documentation-scope"
              onChange={() => {
                setScope('section');
              }}
              type="radio"
            />
            <span>
              <strong>Во всём разделе</strong>
              <small>
                {sectionName} · {sectionFolderCount} {formatFolderCount(sectionFolderCount)}
              </small>
            </span>
          </label>
        </fieldset>

        <fieldset className="ai-documentation-sources">
          <legend>Источники для будущего анализа файлов</legend>
          <label>
            <input checked disabled readOnly type="checkbox" />
            Документы объекта и исполнительные схемы
          </label>
          <label>
            <input checked disabled readOnly type="checkbox" />
            Библиотека сертификатов
          </label>
          <label>
            <input checked disabled readOnly type="checkbox" />
            Общие данные и шаблонные значения раздела
          </label>
        </fieldset>

        <p className="ai-documentation-note">
          <strong>ИИ ничего не утверждает за пользователя.</strong> Пустые акты допустимы, а каждое
          предложение можно изменить или удалить.
        </p>
        <p className="ai-documentation-demo-note">
          В текущем frontend-прототипе помощник создаёт связанные с шаблоном пустые черновики.
          Анализ файлов будет подключён отдельным backend-этапом.
        </p>

        <div className="ai-documentation-dialog__actions">
          <button className="compact-toggle" onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className="action-button action-button--ai"
            disabled={sectionFolderCount === 0}
            onClick={() => {
              onPrepare(scope);
            }}
            type="button"
          >
            <SparklesIcon />
            {scope === 'folder' ? 'Подготовить ИД в папке' : 'Подготовить ИД в разделе'}
          </button>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m12 2 1.45 4.05L17.5 7.5l-4.05 1.45L12 13l-1.45-4.05L6.5 7.5l4.05-1.45L12 2Z" />
      <path d="m18.5 13 1 2.5L22 16.5l-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" />
    </svg>
  );
}

function formatFolderCount(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;

  if (mod100 >= 11 && mod100 <= 14) {
    return 'папок';
  }

  if (mod10 === 1) {
    return 'папка';
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return 'папки';
  }

  return 'папок';
}
