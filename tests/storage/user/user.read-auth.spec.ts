import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { getPrismaClient } from '@/storage/utils';
import { dbUserReadAuthContext } from '@/storage/user/user.read-auth';

describe('dbUserReadAuthContext', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns auth fields for the user', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce({
      id: 'user-1',
      role: 'admin',
      emailVerified: true,
      banned: false,
    });
    vi.mocked(getPrismaClient).mockReturnValue({ user: { findUnique } } as never);

    await expect(dbUserReadAuthContext('user-1')).resolves.toEqual({
      id: 'user-1',
      role: 'admin',
      emailVerified: true,
      banned: false,
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: {
        id: true,
        role: true,
        emailVerified: true,
        banned: true,
      },
    });
  });

  it('returns null when the user does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce(null);
    vi.mocked(getPrismaClient).mockReturnValue({ user: { findUnique } } as never);

    await expect(dbUserReadAuthContext('missing')).resolves.toBeNull();
  });
});
