import type { ReactNode } from 'react';

interface DocumentPreviewDrawerProps {
  readonly children: ReactNode;
  readonly context?: ReactNode;
  readonly contextLabel?: string;
  readonly eyebrow?: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly pageCount?: number;
  readonly title: string;
}

export function DocumentPreviewDrawer({
  children,
  context,
  contextLabel,
  eyebrow,
  isOpen,
  onClose,
  pageCount = 1,
  title,
}: DocumentPreviewDrawerProps): React.JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="document-preview-drawer-overlay">
      <aside
        aria-labelledby="document-preview-drawer-title"
        aria-modal="true"
        className="document-preview-drawer"
        role="dialog"
      >
        <header className="document-preview-drawer__header">
          <div>
            {eyebrow === undefined ? null : <p className="section-kicker">{eyebrow}</p>}
            <h2 id="document-preview-drawer-title">{title}</h2>
            {context === undefined ? null : (
              <div className="document-preview-drawer__context" aria-label={contextLabel}>
                {context}
              </div>
            )}
          </div>
          <button
            className="secondary-action"
            onClick={onClose}
            type="button"
            aria-label="Закрыть предпросмотр документа"
          >
            Закрыть
          </button>
        </header>
        <div className="document-preview-drawer__toolbar" aria-label="Параметры предпросмотра">
          <span>{pageCount === 1 ? '1 страница' : `${String(pageCount)} страницы`}</span>
          <span>Формат A4</span>
          <span>Масштаб 100%</span>
        </div>
        <div className="document-preview-drawer__body">{children}</div>
      </aside>
    </div>
  );
}
