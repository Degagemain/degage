import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

vi.mock('@/storage/user/user.update', () => ({
  dbUserUpdateLocale: vi.fn(),
}));

import { updateUserLocale } from '@/actions/user/update-locale';
import { dbUserUpdateLocale } from '@/storage/user/user.update';

describe('updateUserLocale', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a valid locale', async () => {
    vi.mocked(dbUserUpdateLocale).mockResolvedValueOnce(undefined);

    await updateUserLocale('user-1', 'en');

    expect(dbUserUpdateLocale).toHaveBeenCalledTimes(1);
    expect(dbUserUpdateLocale).toHaveBeenCalledWith('user-1', 'en');
  });

  it('throws ZodError when locale is invalid', async () => {
    await expect(updateUserLocale('user-1', 'de')).rejects.toThrow(ZodError);
    expect(dbUserUpdateLocale).not.toHaveBeenCalled();
  });
});
