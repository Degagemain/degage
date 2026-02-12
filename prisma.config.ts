import { PrismaConfig, defineConfig } from 'prisma/config';

const config: PrismaConfig = {
  schema: 'app/storage/schema.prisma',
  migrations: {
    path: 'app/storage/migrations',
    seed: 'pnpx tsx scripts/seed-fuel-types.ts',
  },
  datasource: {
    // CLI (migrate, etc.) uses direct connection when pooled; fallback to DATABASE_URL for local dev
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },
};

export default defineConfig(config);
