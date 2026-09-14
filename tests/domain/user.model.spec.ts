import { describe, expect, it } from 'vitest';
import { Role } from '@/domain/role.model';
import { userSchema } from '@/domain/user.model';
import { user } from '../builders/user.builder';

describe('userSchema', () => {
  it('accepts a complete user', () => {
    const result = userSchema.safeParse(user({ role: Role.USER }));
    expect(result.success).toBe(true);
  });

  it('accepts a non-uuid better-auth id', () => {
    const result = userSchema.safeParse(user({ id: 'better-auth-user-id' }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('better-auth-user-id');
    }
  });

  it('coerces ISO date strings from JSON', () => {
    const result = userSchema.safeParse({
      ...user(),
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-02-01T00:00:00.000Z',
      banExpires: '2025-03-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.createdAt).toBeInstanceOf(Date);
      expect(result.data.updatedAt).toBeInstanceOf(Date);
      expect(result.data.banExpires).toBeInstanceOf(Date);
    }
  });

  it('fails when name is empty', () => {
    const result = userSchema.safeParse(user({ name: '' }));
    expect(result.success).toBe(false);
  });

  it('fails when email is invalid', () => {
    const result = userSchema.safeParse(user({ email: 'not-an-email' }));
    expect(result.success).toBe(false);
  });

  it('fails when role is invalid', () => {
    const result = userSchema.safeParse({ ...user(), role: 'superadmin' });
    expect(result.success).toBe(false);
  });

  it('fails when unexpected fields are provided', () => {
    const result = userSchema.safeParse({ ...user(), extra: true });
    expect(result.success).toBe(false);
  });
});
