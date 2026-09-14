import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

vi.mock('@/storage/user/user.read', () => ({
  dbUserRead: vi.fn(),
  dbUserCountActiveAdmins: vi.fn(),
}));

vi.mock('@/storage/user/user.update', () => ({
  dbUserUpdate: vi.fn(),
}));

import { AppError } from '@/actions/app.error';
import { updateUser } from '@/actions/user/update';
import { Role } from '@/domain/role.model';
import { dbUserCountActiveAdmins, dbUserRead } from '@/storage/user/user.read';
import { dbUserUpdate } from '@/storage/user/user.update';
import { user } from '../../builders/user.builder';

describe('updateUser', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates and persists an updated user', async () => {
    const existing = user({ role: Role.USER });
    const updated = user({ role: Role.ADMIN, name: 'Promoted' });
    vi.mocked(dbUserRead).mockResolvedValueOnce(existing);
    vi.mocked(dbUserUpdate).mockResolvedValueOnce(updated);

    const result = await updateUser(updated);

    expect(dbUserRead).toHaveBeenCalledWith(updated.id);
    expect(dbUserCountActiveAdmins).not.toHaveBeenCalled();
    expect(dbUserUpdate).toHaveBeenCalledWith(updated);
    expect(result).toEqual(updated);
  });

  it('allows demoting an admin when another admin remains', async () => {
    const existing = user({ role: Role.ADMIN });
    const updated = user({ role: Role.USER });
    vi.mocked(dbUserRead).mockResolvedValueOnce(existing);
    vi.mocked(dbUserCountActiveAdmins).mockResolvedValueOnce(2);
    vi.mocked(dbUserUpdate).mockResolvedValueOnce(updated);

    await expect(updateUser(updated)).resolves.toEqual(updated);
    expect(dbUserCountActiveAdmins).toHaveBeenCalledTimes(1);
    expect(dbUserUpdate).toHaveBeenCalledWith(updated);
  });

  it('rejects demoting the last remaining admin', async () => {
    const existing = user({ role: Role.ADMIN });
    const updated = user({ role: Role.USER });
    vi.mocked(dbUserRead).mockResolvedValueOnce(existing);
    vi.mocked(dbUserCountActiveAdmins).mockResolvedValueOnce(1);

    await expect(updateUser(updated)).rejects.toMatchObject({
      code: 'last_admin',
      httpStatus: 409,
    } satisfies Partial<AppError>);
    expect(dbUserUpdate).not.toHaveBeenCalled();
  });

  it('rejects banning the last remaining admin', async () => {
    const existing = user({ role: Role.ADMIN, banned: false });
    const updated = user({ role: Role.ADMIN, banned: true });
    vi.mocked(dbUserRead).mockResolvedValueOnce(existing);
    vi.mocked(dbUserCountActiveAdmins).mockResolvedValueOnce(1);

    await expect(updateUser(updated)).rejects.toBeInstanceOf(AppError);
    expect(dbUserUpdate).not.toHaveBeenCalled();
  });

  it('throws ZodError when the payload is invalid', async () => {
    await expect(updateUser(user({ name: '' }))).rejects.toThrow(ZodError);
    expect(dbUserRead).not.toHaveBeenCalled();
    expect(dbUserUpdate).not.toHaveBeenCalled();
  });
});
