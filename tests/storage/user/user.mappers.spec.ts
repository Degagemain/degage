import { describe, expect, it } from 'vitest';
import { Role } from '@/domain/role.model';
import { userToDbUpdate } from '@/storage/user/user.mappers';
import { user } from '../../builders/user.builder';

describe('userToDbUpdate', () => {
  it('maps editable fields and keeps a ban reason when banned', () => {
    const banExpires = new Date('2026-01-01T00:00:00Z');
    const result = userToDbUpdate(
      user({
        name: 'Jane',
        locale: 'fr',
        role: Role.ADMIN,
        banned: true,
        banReason: 'abuse',
        banExpires,
      }),
    );

    expect(result).toEqual({
      name: 'Jane',
      locale: 'fr',
      role: Role.ADMIN,
      banned: true,
      banReason: 'abuse',
      banExpires,
    });
  });

  it('clears ban fields when the user is not banned', () => {
    const result = userToDbUpdate(
      user({
        banned: false,
        banReason: 'stale reason',
        banExpires: new Date('2026-01-01T00:00:00Z'),
      }),
    );

    expect(result.banned).toBe(false);
    expect(result.banReason).toBeNull();
    expect(result.banExpires).toBeNull();
  });
});
