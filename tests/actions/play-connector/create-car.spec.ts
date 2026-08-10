import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/play-connector/cars', () => ({
  playConnectorCreateCar: vi.fn(),
}));

import { createPlayCar } from '@/actions/play-connector/create-car';
import { playConnectorCreateCar } from '@/play-connector/cars';

describe('createPlayCar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a car with no fields and returns the id', async () => {
    vi.mocked(playConnectorCreateCar).mockResolvedValueOnce({ id: 3961 });

    await expect(createPlayCar('user-1')).resolves.toEqual({ id: 3961 });

    expect(playConnectorCreateCar).toHaveBeenCalledWith('user-1');
  });
});
