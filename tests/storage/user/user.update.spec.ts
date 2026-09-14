import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

vi.mock('@/storage/user/user.mappers', () => ({
  dbUserToDomain: vi.fn(),
  userToDbUpdate: vi.fn(),
}));

import { Role } from '@/domain/role.model';
import { getPrismaClient } from '@/storage/utils';
import { dbUserToDomain, userToDbUpdate } from '@/storage/user/user.mappers';
import { dbUserUpdate } from '@/storage/user/user.update';
import { user } from '../../builders/user.builder';

describe('dbUserUpdate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates the user and maps the result', async () => {
    const domainUser = user({ role: Role.ADMIN });
    const dbUser = { id: domainUser.id, role: Role.ADMIN };
    const updateData = { name: domainUser.name, role: Role.ADMIN };
    const userUpdate = vi.fn().mockResolvedValueOnce(dbUser);
    const sessionDeleteMany = vi.fn();
    vi.mocked(getPrismaClient).mockReturnValue({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({ user: { update: userUpdate }, session: { deleteMany: sessionDeleteMany } }),
    } as never);
    vi.mocked(userToDbUpdate).mockReturnValueOnce(updateData as never);
    vi.mocked(dbUserToDomain).mockReturnValueOnce(domainUser);

    await expect(dbUserUpdate(domainUser)).resolves.toEqual(domainUser);
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: domainUser.id },
      data: updateData,
    });
    expect(sessionDeleteMany).not.toHaveBeenCalled();
    expect(dbUserToDomain).toHaveBeenCalledWith(dbUser);
  });

  it('revokes sessions when the user is banned', async () => {
    const domainUser = user({ banned: true, role: Role.USER });
    const dbUser = { id: domainUser.id, banned: true };
    const userUpdate = vi.fn().mockResolvedValueOnce(dbUser);
    const sessionDeleteMany = vi.fn().mockResolvedValueOnce({ count: 1 });
    vi.mocked(getPrismaClient).mockReturnValue({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({ user: { update: userUpdate }, session: { deleteMany: sessionDeleteMany } }),
    } as never);
    vi.mocked(userToDbUpdate).mockReturnValueOnce({ banned: true } as never);
    vi.mocked(dbUserToDomain).mockReturnValueOnce(domainUser);

    await expect(dbUserUpdate(domainUser)).resolves.toEqual(domainUser);
    expect(sessionDeleteMany).toHaveBeenCalledWith({ where: { userId: domainUser.id } });
  });
});
