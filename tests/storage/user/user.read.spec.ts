import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { getPrismaClient } from '@/storage/utils';
import { dbUserReadEmailAndLocale } from '@/storage/user/user.read';

describe('dbUserReadEmailAndLocale', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns email and locale for the user', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce({
      email: 'owner@example.com',
      locale: 'nl',
    });
    vi.mocked(getPrismaClient).mockReturnValue({ user: { findUnique } } as never);

    await expect(dbUserReadEmailAndLocale('user-1')).resolves.toEqual({
      email: 'owner@example.com',
      locale: 'nl',
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { email: true, locale: true },
    });
  });

  it('returns null when the user does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce(null);
    vi.mocked(getPrismaClient).mockReturnValue({ user: { findUnique } } as never);

    await expect(dbUserReadEmailAndLocale('missing')).resolves.toBeNull();
  });
});
