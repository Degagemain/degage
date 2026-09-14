import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

vi.mock('@/storage/user/user.mappers', () => ({
  dbUserToDomain: vi.fn(),
}));

import { Role } from '@/domain/role.model';
import { getPrismaClient } from '@/storage/utils';
import { dbUserToDomain } from '@/storage/user/user.mappers';
import { dbUserCountActiveAdmins, dbUserRead, dbUserReadEmailAndLocale } from '@/storage/user/user.read';
import { user } from '../../builders/user.builder';

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

describe('dbUserRead', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the mapped user', async () => {
    const dbUser = { id: 'user-1', name: 'Jane' };
    const domainUser = user({ id: 'user-1', name: 'Jane' });
    const findUniqueOrThrow = vi.fn().mockResolvedValueOnce(dbUser);
    vi.mocked(getPrismaClient).mockReturnValue({ user: { findUniqueOrThrow } } as never);
    vi.mocked(dbUserToDomain).mockReturnValueOnce(domainUser);

    await expect(dbUserRead('user-1')).resolves.toEqual(domainUser);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    expect(dbUserToDomain).toHaveBeenCalledWith(dbUser);
  });
});

describe('dbUserCountActiveAdmins', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('counts non-banned admins', async () => {
    const count = vi.fn().mockResolvedValueOnce(2);
    vi.mocked(getPrismaClient).mockReturnValue({ user: { count } } as never);

    await expect(dbUserCountActiveAdmins()).resolves.toBe(2);
    expect(count).toHaveBeenCalledWith({
      where: {
        role: Role.ADMIN,
        OR: [{ banned: false }, { banned: null }],
      },
    });
  });
});
