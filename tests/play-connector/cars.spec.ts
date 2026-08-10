import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/play-connector/get-admin-mode-session-cookie', () => ({
  getPlayAdminModeSessionCookie: vi.fn(),
}));

vi.mock('@/play-connector/client', () => ({
  fetchPlay: vi.fn(),
}));

import { getPlayAdminModeSessionCookie } from '@/actions/play-connector/get-admin-mode-session-cookie';
import { playConnectorIsCarNameAvailable } from '@/play-connector/cars';
import { fetchPlay } from '@/play-connector/client';

const userId = 'admin-user';
const cookieHeader = 'PLAY_SESSION=upgraded';

describe('playConnectorIsCarNameAvailable', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when pagination total is 0', async () => {
    vi.mocked(getPlayAdminModeSessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockResolvedValueOnce({
      html: '<p id="pagination" name="0,0"></p>',
      status: 200,
    });

    await expect(playConnectorIsCarNameAvailable(userId, 'nonexisting')).resolves.toBe(true);

    const expectedFilter = encodeURIComponent('name=nonexisting,brand=,license_plate=,owner=,zipCode=,city=,district=');
    expect(fetchPlay).toHaveBeenCalledWith(`/cars/page?page=1&pageSize=50&asc=1&orderBy=&filter=${expectedFilter}`, cookieHeader);
  });

  it('returns false when pagination total is greater than 0', async () => {
    vi.mocked(getPlayAdminModeSessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockResolvedValueOnce({
      html: '<p id="pagination" name="1,1"></p>',
      status: 200,
    });

    await expect(playConnectorIsCarNameAvailable(userId, '2Bab')).resolves.toBe(false);
  });

  it('rejects names containing comma or equals', async () => {
    await expect(playConnectorIsCarNameAvailable(userId, 'a,b')).rejects.toMatchObject({ code: 'fetch_failed' });
    await expect(playConnectorIsCarNameAvailable(userId, 'a=b')).rejects.toMatchObject({ code: 'fetch_failed' });
    expect(getPlayAdminModeSessionCookie).not.toHaveBeenCalled();
  });
});
