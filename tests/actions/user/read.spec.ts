import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/user/user.read', () => ({
  dbUserRead: vi.fn(),
}));

import { readUser } from '@/actions/user/read';
import { dbUserRead } from '@/storage/user/user.read';
import { user } from '../../builders/user.builder';

describe('readUser', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the user from storage', async () => {
    const expected = user({ name: 'Jane' });
    vi.mocked(dbUserRead).mockResolvedValueOnce(expected);

    await expect(readUser(expected.id)).resolves.toEqual(expected);
    expect(dbUserRead).toHaveBeenCalledWith(expected.id);
  });
});
