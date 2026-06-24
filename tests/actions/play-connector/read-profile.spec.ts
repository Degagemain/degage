import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('@/actions/play-connector/get-session-cookie', () => ({
  getPlaySessionCookie: vi.fn(),
}));

vi.mock('@/play-connector/client', () => ({
  fetchPlay: vi.fn(),
}));

import { readPlayProfile } from '@/actions/play-connector/read-profile';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';

const profileHtml = readFileSync(join(process.cwd(), 'tests/fixtures/play-connector/profile-page.html'), 'utf8');

describe('readPlayProfile', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches /profile and parses basic info', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'session=abc', expiresAt: new Date() });
    vi.mocked(fetchPlay).mockResolvedValueOnce({ html: profileHtml, status: 200 });

    const result = await readPlayProfile('user-1');

    expect(getPlaySessionCookie).toHaveBeenCalledWith('user-1');
    expect(fetchPlay).toHaveBeenCalledWith('/profile', 'session=abc');
    expect(result).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      degageId: '123456',
      residenceAddress: 'Teststraat 1, 9000 Gent (België)',
      street: 'Teststraat 1',
      zip: '9000',
      city: 'Gent',
      mobilePhone: '0470000001',
    });
  });

  it('returns null when profile HTML cannot be parsed', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'session=abc', expiresAt: new Date() });
    vi.mocked(fetchPlay).mockResolvedValueOnce({ html: '<html></html>', status: 200 });

    const result = await readPlayProfile('user-1');

    expect(result).toBeNull();
  });
});
