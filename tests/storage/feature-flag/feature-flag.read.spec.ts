import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { dbFeatureFlagReadByCode } from '@/storage/feature-flag/feature-flag.read';
import { getPrismaClient } from '@/storage/utils';

describe('dbFeatureFlagReadByCode', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when flag does not exist', async () => {
    const mockPrisma = {
      featureFlag: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbFeatureFlagReadByCode('missing');

    expect(result).toBeNull();
    expect(mockPrisma.featureFlag.findUnique).toHaveBeenCalledWith({ where: { code: 'missing' } });
  });

  it('returns domain flag when found', async () => {
    const now = new Date();
    const mockPrisma = {
      featureFlag: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'flag-1',
          code: 'support-chat',
          description: 'Chat',
          enabled: true,
          createdAt: now,
          updatedAt: now,
        }),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbFeatureFlagReadByCode('support-chat');

    expect(result).toEqual({
      id: 'flag-1',
      code: 'support-chat',
      description: 'Chat',
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
  });
});
