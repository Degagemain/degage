import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/feature-flag/feature-flag.update-enabled', () => ({
  dbFeatureFlagUpdateEnabled: vi.fn(),
}));

import { updateFeatureFlagEnabled } from '@/actions/feature-flag/update-enabled';
import { dbFeatureFlagUpdateEnabled } from '@/storage/feature-flag/feature-flag.update-enabled';
import { featureFlag } from '../../builders/feature-flag.builder';

describe('updateFeatureFlagEnabled', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates enabled when payload is valid', async () => {
    const updated = featureFlag({ enabled: false });
    vi.mocked(dbFeatureFlagUpdateEnabled).mockResolvedValueOnce(updated);

    const result = await updateFeatureFlagEnabled('flag-1', { enabled: false });

    expect(result.enabled).toBe(false);
    expect(dbFeatureFlagUpdateEnabled).toHaveBeenCalledWith('flag-1', false);
  });

  it('rejects invalid payload', async () => {
    await expect(updateFeatureFlagEnabled('flag-1', { enabled: 'yes' })).rejects.toThrow();
    expect(dbFeatureFlagUpdateEnabled).not.toHaveBeenCalled();
  });
});
