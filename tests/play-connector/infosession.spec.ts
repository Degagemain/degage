import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/play-connector/get-session-cookie', () => ({
  getPlaySessionCookie: vi.fn(),
}));

vi.mock('@/play-connector/client', () => ({
  fetchPlay: vi.fn(),
}));

import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';
import { playConnectorEnrollInfosession, playConnectorUnenrollInfosession } from '@/play-connector/infosession';
import { PlayConnectorError } from '@/play-connector/errors';

const userId = 'owner-1';
const cookieHeader = 'PLAY_SESSION=abc';

describe('playConnectorEnrollInfosession', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches enroll with session cookie and encoded id', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockResolvedValueOnce({ html: '', status: 200 });

    await playConnectorEnrollInfosession(userId, '1359');

    expect(getPlaySessionCookie).toHaveBeenCalledWith(userId);
    expect(fetchPlay).toHaveBeenCalledWith('/infosession/enroll?id=1359', cookieHeader);
  });

  it('propagates fetch failures', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockRejectedValueOnce(new PlayConnectorError('fetch_failed', 'Play fetch failed with status 500'));

    await expect(playConnectorEnrollInfosession(userId, '1359')).rejects.toThrow('Play fetch failed with status 500');
  });
});

describe('playConnectorUnenrollInfosession', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches unenroll with session cookie', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader });
    vi.mocked(fetchPlay).mockResolvedValueOnce({ html: '', status: 200 });

    await playConnectorUnenrollInfosession(userId, '1359');

    expect(getPlaySessionCookie).toHaveBeenCalledWith(userId);
    expect(fetchPlay).toHaveBeenCalledWith('/infosession/unenroll', cookieHeader);
  });
});
