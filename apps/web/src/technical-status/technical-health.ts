import type { TechnicalHealthResponse } from '@pto/shared-types';

type TechnicalHealthFetcher = (input: string, init?: RequestInit) => Promise<Response>;

export function buildTechnicalHealthUrl(apiBaseUrl: string | undefined): string {
  const baseUrl = apiBaseUrl?.trim();

  if (baseUrl === undefined || baseUrl.length === 0) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return new URL('health', normalizedBaseUrl).toString();
}

export async function fetchTechnicalHealth(
  apiBaseUrl: string | undefined,
  fetcher: TechnicalHealthFetcher = fetch,
): Promise<TechnicalHealthResponse> {
  const response = await fetcher(buildTechnicalHealthUrl(apiBaseUrl), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Technical health request failed with status ${String(response.status)}.`);
  }

  return parseTechnicalHealthResponse(await response.json());
}

export function parseTechnicalHealthResponse(payload: unknown): TechnicalHealthResponse {
  if (!isRecord(payload)) {
    throw new Error('Unexpected technical health response.');
  }

  const { scope, service, status, timestamp } = payload;

  if (
    scope !== 'technical' ||
    service !== 'api' ||
    status !== 'ok' ||
    typeof timestamp !== 'string' ||
    Number.isNaN(Date.parse(timestamp))
  ) {
    throw new Error('Unexpected technical health response.');
  }

  return {
    scope,
    service,
    status,
    timestamp,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
