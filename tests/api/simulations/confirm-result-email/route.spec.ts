import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/vitest';
  }
});

vi.mock('@/actions/simulation/public-confirm-result-email', () => ({
  publicConfirmResultEmail: vi.fn(),
  SimulationNotSuccessForResultEmailError: class SimulationNotSuccessForResultEmailError extends Error {
    constructor() {
      super('not success');
      this.name = 'SimulationNotSuccessForResultEmailError';
    }
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { POST } from '@/api/simulations/confirm-result-email/route';
import { SimulationNotSuccessForResultEmailError, publicConfirmResultEmail } from '@/actions/simulation/public-confirm-result-email';

const simId = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/simulations/confirm-result-email', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 when request succeeds', async () => {
    vi.mocked(publicConfirmResultEmail).mockResolvedValueOnce(undefined);
    const request = {
      json: vi.fn().mockResolvedValue({ id: simId, email: 'a@b.co' }),
    } as any;
    const res = await POST(request);
    expect(res.status).toBe(204);
    expect(publicConfirmResultEmail).toHaveBeenCalledWith({ id: simId, email: 'a@b.co' });
  });
});
