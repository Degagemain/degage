import { afterEach, describe, expect, it, vi } from 'vitest';

import { enablePlayAdminMode } from '@/play-connector/admin-mode';

describe('enablePlayAdminMode', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('merges upgraded PLAY_SESSION into the cookie header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 303,
        headers: {
          getSetCookie: () => ['PLAY_SESSION=upgraded; Path=/; HttpOnly'],
        },
      }),
    );

    const result = await enablePlayAdminMode('PLAY_LANG=nl; PLAY_SESSION=old');
    expect(result).toBe('PLAY_LANG=nl; PLAY_SESSION=upgraded');
  });

  it('throws when enable does not return a PLAY_SESSION cookie', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 303,
        headers: { getSetCookie: () => [] },
      }),
    );

    await expect(enablePlayAdminMode('PLAY_SESSION=old')).rejects.toMatchObject({ code: 'fetch_failed' });
  });
});
