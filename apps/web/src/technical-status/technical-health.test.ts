import { describe, expect, it } from 'vitest';

import {
  buildTechnicalHealthUrl,
  fetchTechnicalHealth,
  parseTechnicalHealthResponse,
} from './technical-health.js';

describe('technical health client', () => {
  it('builds the health URL from the configured API base URL', () => {
    expect(buildTechnicalHealthUrl('http://localhost:3001')).toBe('http://localhost:3001/health');
    expect(buildTechnicalHealthUrl('http://localhost:3001/api')).toBe(
      'http://localhost:3001/api/health',
    );
  });

  it('fetches the typed technical health response', async () => {
    const calls: { readonly input: string; readonly init: RequestInit | undefined }[] = [];
    const payload = {
      scope: 'technical',
      service: 'api',
      status: 'ok',
      timestamp: '2026-05-28T00:00:00.000Z',
    };
    const fetcher = (input: string, init?: RequestInit): Promise<Response> => {
      calls.push({ input, init });

      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        }),
      );
    };

    await expect(fetchTechnicalHealth('http://localhost:3001', fetcher)).resolves.toEqual(payload);
    expect(calls).toHaveLength(1);
    expect(calls.at(0)?.input).toBe('http://localhost:3001/health');
    expect(calls.at(0)?.init?.headers).toEqual({
      Accept: 'application/json',
    });
  });

  it('fails closed when the API base URL is missing', async () => {
    await expect(fetchTechnicalHealth(undefined)).rejects.toThrow(/VITE_API_BASE_URL/);
  });

  it('rejects non-technical response payloads', () => {
    expect(() =>
      parseTechnicalHealthResponse({
        scope: 'domain',
        service: 'api',
        status: 'ok',
        timestamp: '2026-05-28T00:00:00.000Z',
      }),
    ).toThrow(/Unexpected technical health response/);
  });
});
