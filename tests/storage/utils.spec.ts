import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Prisma adapters and client
vi.mock('@prisma/adapter-neon', () => ({
  PrismaNeon: vi.fn(),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn(),
}));

vi.mock('@/storage/client/client', () => ({
  PrismaClient: vi.fn(),
}));

import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/storage/client/client';
import { sha256Hex } from '@/storage/utils';

describe('sha256Hex', () => {
  const documentationTranslationSource = (title: string, content: string): string => `${title.trim()}\n${content.trim()}`;

  it('matches the documentation translation merge after trim', () => {
    const a = sha256Hex(documentationTranslationSource('  Title  ', '  hello  \n'));
    const b = sha256Hex(documentationTranslationSource('Title', 'hello'));
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it('changes when merged title or body differs', () => {
    const h1 = sha256Hex(documentationTranslationSource('A', 'b'));
    const h2 = sha256Hex(documentationTranslationSource('A', 'c'));
    expect(h1).not.toBe(h2);
  });
});

describe('getPrismaClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to clear the singleton between tests
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore original env
    process.env = { ...originalEnv };
  });

  it('throws an error when DATABASE_URL is not set', async () => {
    delete process.env.DATABASE_URL;

    const { getPrismaClient } = await import('@/storage/utils');

    expect(() => getPrismaClient()).toThrow('DATABASE_URL is not set');
  });

  it('uses PrismaNeon adapter when DATABASE_URL contains .neon.tech', async () => {
    const neonUrl = 'postgresql://user:pass@ep-example.region.neon.tech/db?sslmode=require';
    process.env.DATABASE_URL = neonUrl;

    vi.mocked(PrismaNeon).mockImplementation(
      class PrismaNeonMock {
        constructor() {}
      } as any,
    );
    vi.mocked(PrismaClient).mockImplementation(
      class PrismaClientMock {
        constructor() {}
      } as any,
    );

    const { getPrismaClient } = await import('@/storage/utils');
    const result = getPrismaClient();
    const neonAdapterInstance = vi.mocked(PrismaNeon).mock.instances[0];
    const prismaClientInstance = vi.mocked(PrismaClient).mock.instances[0];

    expect(PrismaNeon).toHaveBeenCalledTimes(1);
    expect(PrismaNeon).toHaveBeenCalledWith({ connectionString: neonUrl });
    expect(PrismaPg).not.toHaveBeenCalled();
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: neonAdapterInstance });
    expect(result).toBe(prismaClientInstance);
  });

  it('uses PrismaPg adapter when DATABASE_URL does not contain .neon.tech', async () => {
    const pgUrl = 'postgresql://user:pass@localhost:5432/db';
    process.env.DATABASE_URL = pgUrl;

    vi.mocked(PrismaPg).mockImplementation(
      class PrismaPgMock {
        constructor() {}
      } as any,
    );
    vi.mocked(PrismaClient).mockImplementation(
      class PrismaClientMock {
        constructor() {}
      } as any,
    );

    const { getPrismaClient } = await import('@/storage/utils');
    const result = getPrismaClient();
    const pgAdapterInstance = vi.mocked(PrismaPg).mock.instances[0];
    const prismaClientInstance = vi.mocked(PrismaClient).mock.instances[0];

    expect(PrismaPg).toHaveBeenCalledTimes(1);
    expect(PrismaPg).toHaveBeenCalledWith({ connectionString: pgUrl });
    expect(PrismaNeon).not.toHaveBeenCalled();
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: pgAdapterInstance });
    expect(result).toBe(prismaClientInstance);
  });

  it('returns the same instance on subsequent calls (singleton pattern)', async () => {
    const pgUrl = 'postgresql://user:pass@localhost:5432/db';
    process.env.DATABASE_URL = pgUrl;

    vi.mocked(PrismaPg).mockImplementation(
      class PrismaPgMock {
        constructor() {}
      } as any,
    );
    vi.mocked(PrismaClient).mockImplementation(
      class PrismaClientMock {
        constructor() {}
      } as any,
    );

    const { getPrismaClient } = await import('@/storage/utils');

    const result1 = getPrismaClient();
    const result2 = getPrismaClient();
    const result3 = getPrismaClient();

    // Should only create one instance
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });
});
