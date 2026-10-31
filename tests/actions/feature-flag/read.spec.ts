import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/feature-flag/feature-flag.read', () => ({
  dbFeatureFlagRead: vi.fn(),
  dbFeatureFlagReadByCode: vi.fn(),
}));

import { getFeatureFlagByCode, isFeatureFlagEnabled, readFeatureFlag } from '@/actions/feature-flag/read';
import { dbFeatureFlagRead, dbFeatureFlagReadByCode } from '@/storage/feature-flag/feature-flag.read';
import { featureFlag } from '../../builders/feature-flag.builder';

describe('feature-flag read actions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('readFeatureFlag delegates to storage', async () => {
    const flag = featureFlag({ id: 'flag-1' });
    vi.mocked(dbFeatureFlagRead).mockResolvedValueOnce(flag);

    await expect(readFeatureFlag('flag-1')).resolves.toEqual(flag);
    expect(dbFeatureFlagRead).toHaveBeenCalledWith('flag-1');
  });

  it('isFeatureFlagEnabled is true only when enabled is true', async () => {
    vi.mocked(dbFeatureFlagReadByCode).mockResolvedValueOnce(featureFlag({ enabled: true }));
    await expect(isFeatureFlagEnabled('support-chat')).resolves.toBe(true);

    vi.mocked(dbFeatureFlagReadByCode).mockResolvedValueOnce(featureFlag({ enabled: false }));
    await expect(isFeatureFlagEnabled('support-chat')).resolves.toBe(false);

    vi.mocked(dbFeatureFlagReadByCode).mockResolvedValueOnce(null);
    await expect(isFeatureFlagEnabled('support-chat')).resolves.toBe(false);
  });

  it('getFeatureFlagByCode returns null when missing', async () => {
    vi.mocked(dbFeatureFlagReadByCode).mockResolvedValueOnce(null);
    await expect(getFeatureFlagByCode('missing')).resolves.toBeNull();
  });
});
