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
import { buildPlayCarCreatePayload, playConnectorCreateCar, playConnectorIsCarNameAvailable } from '@/play-connector/cars';
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

describe('buildPlayCarCreatePayload', () => {
  it('returns Play defaults for empty input', () => {
    expect(buildPlayCarCreatePayload({})).toMatchObject({
      id: -1,
      status: 'REGISTERED',
      name: 'temporary',
      fuel: 'ELECTRIC',
      purchaseDate: 'STILLTOBEPURCHASED',
      maxReservationDuration: 'INFINITE',
      maxTimeBeforeReservation: 'THREEMONTHS',
      minTimeBeforeReservation: 'NONE',
      location: { city: '', street: '', num: '', zip: '' },
    });
  });

  it('merges nested location and insurance overrides', () => {
    const payload = buildPlayCarCreatePayload({
      brand: 'Opel',
      fuel: 'PETROL',
      location: { city: 'Gent', zip: '9000' },
      insurance: { name: 'KBC', expiration: '2025-08-09' },
      technicalCarDetails: { licensePlate: '2gmm226' },
    });

    expect(payload.brand).toBe('Opel');
    expect(payload.fuel).toBe('PETROL');
    expect(payload.location).toEqual({ city: 'Gent', street: '', num: '', zip: '9000' });
    expect(payload.insurance).toMatchObject({ name: 'KBC', expiration: '2025-08-09', bonusMalus: '' });
    expect(payload.technicalCarDetails.licensePlate).toBe('2gmm226');
  });
});

describe('playConnectorCreateCar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('posts to /api/cars/new and returns the created car id', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'PLAY_SESSION=user' });
    vi.mocked(postPlayJson).mockResolvedValueOnce({
      text: JSON.stringify({ id: 3961, name: 'temporary' }),
      status: 200,
    });

    await expect(playConnectorCreateCar(userId, { brand: 'Opel', fuel: 'PETROL' })).resolves.toEqual({ id: 3961 });

    expect(getPlaySessionCookie).toHaveBeenCalledWith(userId);
    expect(postPlayJson).toHaveBeenCalledWith(
      '/api/cars/new',
      'PLAY_SESSION=user',
      expect.objectContaining({ brand: 'Opel', fuel: 'PETROL', id: -1, status: 'REGISTERED' }),
    );
  });

  it('throws when response JSON is missing a positive id', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'PLAY_SESSION=user' });
    vi.mocked(postPlayJson).mockResolvedValueOnce({
      text: JSON.stringify({ name: 'temporary' }),
      status: 200,
    });

    await expect(playConnectorCreateCar(userId, {})).rejects.toMatchObject({ code: 'fetch_failed' });
  });

  it('throws when response is not valid JSON', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'PLAY_SESSION=user' });
    vi.mocked(postPlayJson).mockResolvedValueOnce({
      text: 'not-json',
      status: 200,
    });

    await expect(playConnectorCreateCar(userId, {})).rejects.toMatchObject({ code: 'fetch_failed' });
  });
});
