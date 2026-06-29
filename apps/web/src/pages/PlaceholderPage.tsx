import { useEffect, useState } from 'react';

import type { TechnicalHealthResponse } from '@pto/shared-types';

import { webEnv } from '../config/env.js';
import { fetchTechnicalHealth } from '../technical-status/technical-health.js';

type BackendStatusState =
  | {
      readonly kind: 'loading';
    }
  | {
      readonly health: TechnicalHealthResponse;
      readonly kind: 'ok';
    }
  | {
      readonly kind: 'error';
      readonly message: string;
    };

export function PlaceholderPage(): React.JSX.Element {
  const [backendStatus, setBackendStatus] = useState<BackendStatusState>({ kind: 'loading' });

  useEffect(() => {
    let isMounted = true;

    setBackendStatus({ kind: 'loading' });

    void fetchTechnicalHealth(webEnv.VITE_API_BASE_URL)
      .then((health) => {
        if (isMounted) {
          setBackendStatus({ health, kind: 'ok' });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setBackendStatus({
            kind: 'error',
            message: getErrorMessage(error),
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="status-panel" aria-label="Application status">
        <p className="eyebrow">ИДея</p>
        <h1>Рабочее место ПТО для исполнительной документации</h1>
        <p className="status-text">Технический статус демо-окружения приложения.</p>
        <section className="backend-status" aria-label="Backend status">
          <div>
            <h2>Technical status</h2>
            <p className="backend-status__text">{renderBackendStatusText(backendStatus)}</p>
          </div>
          <span className={`backend-status__badge backend-status__badge--${backendStatus.kind}`}>
            {renderBackendStatusBadge(backendStatus)}
          </span>
        </section>
      </section>
    </main>
  );
}

function renderBackendStatusText(status: BackendStatusState): string {
  if (status.kind === 'loading') {
    return 'Checking technical endpoint...';
  }

  if (status.kind === 'error') {
    return status.message;
  }

  const databaseStatus = status.health.dependencies?.database?.status ?? 'unknown';
  const storageStatus = status.health.dependencies?.storage?.status ?? 'unknown';

  return `${status.health.service} / ${status.health.scope} / ${status.health.timestamp} / db ${databaseStatus} / storage ${storageStatus}`;
}

function renderBackendStatusBadge(status: BackendStatusState): string {
  if (status.kind === 'ok') {
    return status.health.status;
  }

  return status.kind;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Backend status check failed.';
}
