import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/play-connector/cars', () => ({
  playConnectorUpdateCar: vi.fn(),
}));

import { updatePlayCar } from '@/actions/play-connector/update-car';
import { playConnectorUpdateCar } from '@/play-connector/cars';

describe('updatePlayCar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates input and updates a car as admin', async () => {
    vi.mocked(playConnectorUpdateCar).mockResolvedValueOnce(undefined);

    await expect(updatePlayCar('admin-1', 3961, { brand: 'Opel', carType: 'PASSENGER_CAR' })).resolves.toBeUndefined();

    expect(playConnectorUpdateCar).toHaveBeenCalledWith('admin-1', 3961, { brand: 'Opel', carType: 'PASSENGER_CAR' });
  });

  it('rejects invalid vehicle type before calling play connector', async () => {
    await expect(updatePlayCar('admin-1', 3961, { carType: 'TRUCK' } as never)).rejects.toThrow();
    expect(playConnectorUpdateCar).not.toHaveBeenCalled();
  });
});
