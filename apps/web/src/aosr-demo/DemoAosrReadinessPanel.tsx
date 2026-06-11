import type { DemoAosrReadiness } from './demo-aosr-readiness.js';

interface DemoAosrReadinessPanelProps {
  readonly readiness: DemoAosrReadiness;
}

export function DemoAosrReadinessPanel({
  readiness,
}: DemoAosrReadinessPanelProps): React.JSX.Element {
  const headingId = 'aosr-readiness-title';

  return (
    <section
      className={`readiness-card readiness-card--${readiness.status}`}
      aria-labelledby={headingId}
    >
      <div className="readiness-card__header">
        <div>
          <p className="section-kicker">Диагностика</p>
          <h3 id={headingId}>Проверка заполнения</h3>
        </div>
        <strong className="readiness-card__status">{readiness.statusLabel}</strong>
      </div>

      <p className="readiness-card__helper">
        Пустые поля не блокируют печать: в печатной форме будут оставлены строки для заполнения от
        руки.
      </p>

      {readiness.issues.length > 0 ? (
        <div className="readiness-card__issues">
          <p>Пустые разделы:</p>
          <ul>
            {readiness.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="readiness-card__empty">Пробелов по демо-проверкам нет.</p>
      )}
    </section>
  );
}
