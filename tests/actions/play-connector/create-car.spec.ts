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

  it('validates input and creates a car', async () => {
    vi.mocked(playConnectorCreateCar).mockResolvedValueOnce({ id: 3961 });

    await expect(createPlayCar('user-1', { brand: 'Opel', fuel: 'PETROL' })).resolves.toEqual({ id: 3961 });

    expect(playConnectorCreateCar).toHaveBeenCalledWith('user-1', { brand: 'Opel', fuel: 'PETROL' });
  });

  it('rejects invalid fuel before calling play connector', async () => {
    await expect(createPlayCar('user-1', { fuel: 'BIODIESEL' } as never)).rejects.toThrow();
    expect(playConnectorCreateCar).not.toHaveBeenCalled();
  });
});
