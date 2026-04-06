import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/vitest';
  }
});

vi.mock('@/actions/simulation/public-request-manual-review', () => ({
  publicRequestManualReview: vi.fn(),
  SimulationNotManualReviewError: class SimulationNotManualReviewError extends Error {
    constructor() {
      super('Simulation is not in manual review');
      this.name = 'SimulationNotManualReviewError';
    }
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { POST } from '@/api/simulations/request-manual-review/route';
import { SimulationNotManualReviewError, publicRequestManualReview } from '@/actions/simulation/public-request-manual-review';

const simId = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/simulations/request-manual-review', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 when request succeeds', async () => {
    vi.mocked(publicRequestManualReview).mockResolvedValueOnce(undefined);
    const request = {
      json: vi.fn().mockResolvedValue({ id: simId, email: 'a@b.co' }),
    } as any;
    const res = await POST(request);
    expect(res.status).toBe(204);
    expect(publicRequestManualReview).toHaveBeenCalledWith({ id: simId, email: 'a@b.co' });
  });
});
