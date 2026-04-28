import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/documentation/get-by-external-id-for-viewer', () => ({
  getDocumentationByExternalIdForViewer: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'en' }) }),
}));

import { GET } from '@/api/documentation/by-external-id/[externalId]/route';
import { auth } from '@/auth';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';

describe('GET /api/documentation/by-external-id/[externalId]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with doc payload', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    vi.mocked(getDocumentationByExternalIdForViewer).mockResolvedValueOnce({
      ok: true,
      doc: {
        externalId: 'repo:test',
        source: 'repository',
        format: 'markdown',
        title: 'T',
        content: 'C',
        locale: 'en',
      },
    });

    const request = new Request('http://localhost/api/documentation/by-external-id/repo%3Atest');
    const res = await GET(request as any, { params: Promise.resolve({ externalId: 'repo%3Atest' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe('T');
  });

  it('returns 404 when not found', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    vi.mocked(getDocumentationByExternalIdForViewer).mockResolvedValueOnce({ ok: false, reason: 'not_found' });
    const res = await GET(new Request('http://localhost/x') as any, {
      params: Promise.resolve({ externalId: 'missing' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 403 when documentation audience forbids the viewer', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { role: 'user', banned: false } } as any);
    vi.mocked(getDocumentationByExternalIdForViewer).mockResolvedValueOnce({ ok: false, reason: 'forbidden' });
    const res = await GET(new Request('http://localhost/x') as any, {
      params: Promise.resolve({ externalId: 'repo:admin-only' }),
    });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.code).toBe('forbidden');
  });

  it('passes publicCatalogOnly when publicCatalog=true', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { role: 'admin', banned: false } } as any);
    vi.mocked(getDocumentationByExternalIdForViewer).mockResolvedValueOnce({
      ok: true,
      doc: {
        externalId: 'repo:test',
        source: 'repository',
        format: 'markdown',
        title: 'T',
        content: 'C',
        locale: 'en',
      },
    });

    const res = await GET(new Request('http://localhost/api/documentation/by-external-id/repo%3Atest?publicCatalog=true') as any, {
      params: Promise.resolve({ externalId: 'repo%3Atest' }),
    });
    expect(res.status).toBe(200);
    expect(getDocumentationByExternalIdForViewer).toHaveBeenCalledWith('repo:test', 'en', true, { publicCatalogOnly: true });
  });
});
