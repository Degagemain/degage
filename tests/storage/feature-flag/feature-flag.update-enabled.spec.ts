import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { dbFeatureFlagUpdateEnabled } from '@/storage/feature-flag/feature-flag.update-enabled';
import { getPrismaClient } from '@/storage/utils';

describe('dbFeatureFlagUpdateEnabled', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates enabled and returns domain flag', async () => {
    const now = new Date();
    const mockPrisma = {
      featureFlag: {
        update: vi.fn().mockResolvedValue({
          id: 'flag-1',
          code: 'support-chat',
          description: 'Chat',
          enabled: false,
          createdAt: now,
          updatedAt: now,
        }),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbFeatureFlagUpdateEnabled('flag-1', false);

    expect(mockPrisma.featureFlag.update).toHaveBeenCalledWith({
      where: { id: 'flag-1' },
      data: { enabled: false },
    });
    expect(result.enabled).toBe(false);
    expect(result.code).toBe('support-chat');
  });
});
