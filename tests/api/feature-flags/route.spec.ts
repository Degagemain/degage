import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/feature-flag/list', () => ({
  searchFeatureFlags: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/feature-flags/route';
import { auth } from '@/auth';
import { searchFeatureFlags } from '@/actions/feature-flag/list';
import { featureFlag } from '../../builders/feature-flag.builder';

describe('GET /api/feature-flags', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    vi.mocked(searchFeatureFlags).mockResolvedValueOnce({
      records: [featureFlag()],
      total: 1,
    });

    const request = {
      nextUrl: new URL('http://localhost/api/feature-flags'),
    } as any;

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.records).toHaveLength(1);
    expect(json.total).toBe(1);
    expect(searchFeatureFlags).toHaveBeenCalledTimes(1);
  });
});
