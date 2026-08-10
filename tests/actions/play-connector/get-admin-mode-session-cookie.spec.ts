import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/play-connector/get-session-cookie', () => ({
  getPlaySessionCookie: vi.fn(),
}));

vi.mock('@/play-connector/admin-mode', () => ({
  enablePlayAdminMode: vi.fn(),
}));

vi.mock('@/play-connector/client', () => ({
  fetchPlay: vi.fn(),
}));

import { getPlayAdminModeSessionCookie } from '@/actions/play-connector/get-admin-mode-session-cookie';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { enablePlayAdminMode } from '@/play-connector/admin-mode';
import { fetchPlay } from '@/play-connector/client';
import { PlayConnectorError } from '@/play-connector/errors';

const fixtures = join(process.cwd(), 'tests/fixtures/play-connector');
const userId = 'admin-user';
const baseCookie = 'PLAY_SESSION=base';
const upgradedCookie = 'PLAY_SESSION=upgraded';

describe('getPlayAdminModeSessionCookie', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns upgraded cookie when admin mode is enabled', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: baseCookie });
    vi.mocked(enablePlayAdminMode).mockResolvedValueOnce(upgradedCookie);
    vi.mocked(fetchPlay).mockResolvedValueOnce({
      html: readFileSync(join(fixtures, 'home-admin-mode.html'), 'utf8'),
      status: 200,
    });

    const result = await getPlayAdminModeSessionCookie(userId);

    expect(getPlaySessionCookie).toHaveBeenCalledWith(userId);
    expect(enablePlayAdminMode).toHaveBeenCalledWith(baseCookie);
    expect(fetchPlay).toHaveBeenCalledWith('/', upgradedCookie);
    expect(result.cookieHeader).toBe(upgradedCookie);
  });

  it('throws unauthorized when enable fails', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: baseCookie });
    vi.mocked(enablePlayAdminMode).mockRejectedValueOnce(new PlayConnectorError('fetch_failed', 'failed'));

    await expect(getPlayAdminModeSessionCookie(userId)).rejects.toMatchObject({ code: 'unauthorized' });
  });

  it('throws unauthorized when home page has no admin/clear link', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: baseCookie });
    vi.mocked(enablePlayAdminMode).mockResolvedValueOnce(upgradedCookie);
    vi.mocked(fetchPlay).mockResolvedValueOnce({
      html: readFileSync(join(fixtures, 'home-normal.html'), 'utf8'),
      status: 200,
    });

    await expect(getPlayAdminModeSessionCookie(userId)).rejects.toMatchObject({ code: 'unauthorized' });
  });
});
