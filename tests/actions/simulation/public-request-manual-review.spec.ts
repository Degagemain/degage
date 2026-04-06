import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/simulation/read', () => ({
  readSimulation: vi.fn(),
}));

vi.mock('@/actions/simulation/update', () => ({
  updateSimulation: vi.fn(),
}));

import { publicRequestManualReview } from '@/actions/simulation/public-request-manual-review';
import { readSimulation } from '@/actions/simulation/read';
import { updateSimulation } from '@/actions/simulation/update';
import { SimulationResultCode } from '@/domain/simulation.model';
import { simulation } from '../../builders/simulation.builder';

const simId = '550e8400-e29b-41d4-a716-446655440000';

describe('publicRequestManualReview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates email when simulation is manual review', async () => {
    vi.mocked(readSimulation).mockResolvedValueOnce(simulation({ id: simId, resultCode: SimulationResultCode.MANUAL_REVIEW, error: null }));
    vi.mocked(updateSimulation).mockResolvedValueOnce({ id: simId, email: 'a@b.co' });

    await publicRequestManualReview({ id: simId, email: 'a@b.co' });

    expect(updateSimulation).toHaveBeenCalledWith({ id: simId, email: 'a@b.co' });
  });
});
