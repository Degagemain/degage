import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.get-by-external-id', () => ({
  dbDocumentationGetByExternalId: vi.fn(),
}));

import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { dbDocumentationGetByExternalId } from '@/storage/documentation/documentation.get-by-external-id';
import { documentation } from '../../builders/documentation.builder';

describe('getDocumentationByExternalIdForViewer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns not_found when no row', async () => {
    vi.mocked(dbDocumentationGetByExternalId).mockResolvedValueOnce(null);
    const r = await getDocumentationByExternalIdForViewer('repo:any', 'en', false);
    expect(r).toEqual({ ok: false, reason: 'not_found' });
  });

  it('returns forbidden for admin-audience doc when viewer is not admin', async () => {
    vi.mocked(dbDocumentationGetByExternalId).mockResolvedValueOnce(documentation({ audienceRoles: ['admin'], externalId: 'repo:x' }));
    const r = await getDocumentationByExternalIdForViewer('repo:x', 'en', false);
    expect(r).toEqual({ ok: false, reason: 'forbidden' });
  });

  it('returns forbidden for technical-audience doc when viewer is not admin', async () => {
    vi.mocked(dbDocumentationGetByExternalId).mockResolvedValueOnce(documentation({ audienceRoles: ['technical'], externalId: 'repo:x' }));
    const r = await getDocumentationByExternalIdForViewer('repo:x', 'en', false);
    expect(r).toEqual({ ok: false, reason: 'forbidden' });
  });

  it('returns forbidden when doc mixes user and admin audience and viewer is not admin', async () => {
    vi.mocked(dbDocumentationGetByExternalId).mockResolvedValueOnce(documentation({ audienceRoles: ['user', 'admin'], externalId: 'repo:x' }));
    const r = await getDocumentationByExternalIdForViewer('repo:x', 'en', false);
    expect(r).toEqual({ ok: false, reason: 'forbidden' });
  });

  it('returns ok for public-only doc when viewer is not admin', async () => {
    vi.mocked(dbDocumentationGetByExternalId).mockResolvedValueOnce(
      documentation({ audienceRoles: ['public', 'user'], externalId: 'repo:faq' }),
    );
    const r = await getDocumentationByExternalIdForViewer('repo:faq', 'en', false);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.doc.title).toBeDefined();
      expect(r.doc.externalId).toBe('repo:faq');
    }
  });

  it('returns ok for admin-audience doc when viewer is admin', async () => {
    vi.mocked(dbDocumentationGetByExternalId).mockResolvedValueOnce(documentation({ audienceRoles: ['admin'], externalId: 'repo:internal' }));
    const r = await getDocumentationByExternalIdForViewer('repo:internal', 'en', true);
    expect(r.ok).toBe(true);
  });
});
