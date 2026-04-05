import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/simulation/export', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/actions/simulation/export')>();
  return {
    ...actual,
    exportSimulations: vi.fn(),
    exportSimulationsCsv: vi.fn(),
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => `t(${key})`),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({
    get: (name: string) => (name === 'locale' ? { value: 'en' } : undefined),
  }),
}));

import { GET } from '@/api/simulations/export/route';
import { auth } from '@/auth';
import { exportSimulations, exportSimulationsCsv } from '@/actions/simulation/export';
import { simulation } from '../../../builders/simulation.builder';

const mockAdmin = { id: 'a', name: 'A', email: 'a@x.com', role: 'admin', banned: false };
const mockUser = { id: 'u', name: 'U', email: 'u@x.com', role: 'user', banned: false };

describe('GET /api/simulations/export', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = { nextUrl: new URL('http://localhost/api/simulations/export?format=json') } as any;
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(exportSimulations).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated but not admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const request = { nextUrl: new URL('http://localhost/api/simulations/export?format=json') } as any;
    const response = await GET(request);
    expect(response.status).toBe(403);
    expect(exportSimulations).not.toHaveBeenCalled();
  });

  it('returns 400 when format is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdmin } as any);
    const request = { nextUrl: new URL('http://localhost/api/simulations/export') } as any;
    const response = await GET(request);
    expect(response.status).toBe(400);
    expect(exportSimulations).not.toHaveBeenCalled();
  });

  it('returns 200 JSON attachment for admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdmin } as any);
    const row = simulation({ id: 'export-1' });
    vi.mocked(exportSimulations).mockResolvedValueOnce([row]);

    const request = { nextUrl: new URL('http://localhost/api/simulations/export?format=json') } as any;
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(exportSimulations).toHaveBeenCalledTimes(1);
    const json = await response.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe('export-1');
  });

  it('returns 200 CSV for admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdmin } as any);
    vi.mocked(exportSimulationsCsv).mockResolvedValueOnce('t(columns.town),t(columns.resultCode)\r\nTown,t(manualReview)');

    const request = { nextUrl: new URL('http://localhost/api/simulations/export?format=csv') } as any;
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/csv');
    expect(response.headers.get('Content-Disposition')).toContain('.csv');
    const text = await response.text();
    expect(text).toContain('t(columns.town)');
    expect(text).toContain('t(manualReview)');
    expect(exportSimulationsCsv).toHaveBeenCalledTimes(1);
    expect(exportSimulations).not.toHaveBeenCalled();
  });
});
