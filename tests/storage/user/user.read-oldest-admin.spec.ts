import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { Role } from '@/domain/role.model';
import { getPrismaClient } from '@/storage/utils';
import { dbUserReadOldestAdmin } from '@/storage/user/user.read-oldest-admin';

describe('dbUserReadOldestAdmin', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the oldest non-banned admin', async () => {
    const findFirst = vi.fn().mockResolvedValueOnce({ id: 'admin-oldest' });
    vi.mocked(getPrismaClient).mockReturnValue({ user: { findFirst } } as never);

    await expect(dbUserReadOldestAdmin()).resolves.toEqual({ id: 'admin-oldest' });
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        role: Role.ADMIN,
        OR: [{ banned: false }, { banned: null }],
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
  });

  it('returns null when no admin exists', async () => {
    const findFirst = vi.fn().mockResolvedValueOnce(null);
    vi.mocked(getPrismaClient).mockReturnValue({ user: { findFirst } } as never);

    await expect(dbUserReadOldestAdmin()).resolves.toBeNull();
  });
});
