import { createHash } from 'node:crypto';

import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './client/client';

let prismaClient: PrismaClient | null = null;

export const getPrismaClient = () => {
  if (prismaClient) {
    return prismaClient;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  prismaClient = process.env.DATABASE_URL.includes('.neon.tech')
    ? new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
    : new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  return prismaClient;
};

export const toVectorLiteral = (embedding: number[]): string => {
  return `[${embedding.map((n) => Number(n).toString()).join(',')}]`;
};

export const sha256Hex = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};
