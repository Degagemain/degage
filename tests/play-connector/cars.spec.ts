import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/play-connector/get-admin-mode-session-cookie', () => ({
  getPlayAdminModeSessionCookie: vi.fn(),
}));

vi.mock('@/actions/play-connector/get-session-cookie', () => ({
  getPlaySessionCookie: vi.fn(),
}));

vi.mock('@/play-connector/client', () => ({
  fetchPlay: vi.fn(),
  postPlayJson: vi.fn(),
}));

import { getPlayAdminModeSessionCookie } from '@/actions/play-connector/get-admin-mode-session-cookie';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { playConnectorCreateCar, playConnectorIsCarNameAvailable } from '@/play-connector/cars';
import { fetchPlay, postPlayJson } from '@/play-connector/client';

const userId = 'admin-user';
const cookieHeader = 'PLAY_SESSION=upgraded';

describe('playConnectorIsCarNameAvailable', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when no car names match', async () => {
    vi.mocked(getPlayAdminModeSessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockResolvedValueOnce({
      html: '<td class="empty-row">Geen enkele auto</td>',
      status: 200,
    });

    await expect(playConnectorIsCarNameAvailable(userId, 'nonexisting')).resolves.toBe(true);

    const expectedFilter = encodeURIComponent('name=nonexisting,brand=,license_plate=,owner=,zipCode=,city=,district=');
    expect(fetchPlay).toHaveBeenCalledWith(`/cars/page?page=1&pageSize=50&asc=1&orderBy=&filter=${expectedFilter}`, cookieHeader);
  });

  it('returns false when a result name matches case-insensitively', async () => {
    vi.mocked(getPlayAdminModeSessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockResolvedValueOnce({
      html: '<a href="/cars/view?id=3493">2BAB</a>',
      status: 200,
    });

    await expect(playConnectorIsCarNameAvailable(userId, '2Bab')).resolves.toBe(false);
  });

  it('returns true when results are substring hits without an exact name match', async () => {
    vi.mocked(getPlayAdminModeSessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockResolvedValueOnce({
      html: '<a href="/cars/view?id=3493">2BAB</a>',
      status: 200,
    });

    await expect(playConnectorIsCarNameAvailable(userId, 'Bab')).resolves.toBe(true);
  });

  it('rejects names containing comma or equals', async () => {
    await expect(playConnectorIsCarNameAvailable(userId, 'a,b')).rejects.toMatchObject({ code: 'fetch_failed' });
    await expect(playConnectorIsCarNameAvailable(userId, 'a=b')).rejects.toMatchObject({ code: 'fetch_failed' });
    expect(getPlayAdminModeSessionCookie).not.toHaveBeenCalled();
  });
});

describe('playConnectorCreateCar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('posts an empty Play car payload and returns the created car id', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'PLAY_SESSION=user' });
    vi.mocked(postPlayJson).mockResolvedValueOnce({
      text: JSON.stringify({ id: 3961, name: 'temporary' }),
      status: 200,
    });

    await expect(playConnectorCreateCar(userId)).resolves.toEqual({ id: 3961 });

    expect(getPlaySessionCookie).toHaveBeenCalledWith(userId);
    expect(postPlayJson).toHaveBeenCalledWith(
      '/api/cars/new',
      'PLAY_SESSION=user',
      expect.objectContaining({
        id: -1,
        status: 'REGISTERED',
        name: 'temporary',
        brand: '',
        fuel: 'ELECTRIC',
        purchaseDate: 'STILLTOBEPURCHASED',
      }),
    );
  });

  it('throws when response JSON is missing a positive id', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'PLAY_SESSION=user' });
    vi.mocked(postPlayJson).mockResolvedValueOnce({
      text: JSON.stringify({ name: 'temporary' }),
      status: 200,
    });

    await expect(playConnectorCreateCar(userId)).rejects.toMatchObject({ code: 'fetch_failed' });
  });

  it('throws when response is not valid JSON', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'PLAY_SESSION=user' });
    vi.mocked(postPlayJson).mockResolvedValueOnce({
      text: 'not-json',
      status: 200,
    });

    await expect(playConnectorCreateCar(userId)).rejects.toMatchObject({ code: 'fetch_failed' });
  });
});
