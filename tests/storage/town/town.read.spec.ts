import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { dbTownFindByZipAndCity } from '@/storage/town/town.read';
import { getPrismaClient } from '@/storage/utils';

describe('dbTownFindByZipAndCity', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no towns match the zip', async () => {
    const mockPrisma = {
      town: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbTownFindByZipAndCity('9000', 'Gent');

    expect(result).toBeNull();
  });

  it('returns the town when zip matches exactly one row', async () => {
    const mockPrisma = {
      town: {
        findMany: vi.fn().mockResolvedValue([{ id: 'town-1', name: 'Gent', municipality: 'Gent' }]),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbTownFindByZipAndCity('9000', 'Gent');

    expect(result).toEqual({ id: 'town-1' });
  });

  it('disambiguates by city when multiple towns share a zip', async () => {
    const mockPrisma = {
      town: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'town-1', name: 'Mariakerke', municipality: 'Gent' },
          { id: 'town-2', name: 'Wondelgem', municipality: 'Gent' },
        ]),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbTownFindByZipAndCity('9000', 'Mariakerke');

    expect(result).toEqual({ id: 'town-1' });
  });

  it('returns null when multiple towns share a zip and city is ambiguous', async () => {
    const mockPrisma = {
      town: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'town-1', name: 'Mariakerke', municipality: 'Gent' },
          { id: 'town-2', name: 'Drongen', municipality: 'Gent' },
        ]),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbTownFindByZipAndCity('9000', 'Gent');

    expect(result).toBeNull();
  });
});
