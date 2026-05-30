import { execSync } from 'node:child_process';

import { PostgreSqlContainer } from '@testcontainers/postgresql';

import { PG_DEFAULT_DATABASE, PG_IMAGE, PG_PASSWORD, PG_TEMPLATE_DATABASE, PG_USER } from './constants';
import { ROOT_ENV_FILE, buildE2eProcessEnv, writeCiBuildEnvFile } from './shared/load-e2e-env';
import { createTemplateDatabase, getTemplateDatabaseUrl } from './shared/db';
import { writeContainerState } from './shared/state';

export default async function globalSetup() {
  const container = await new PostgreSqlContainer(PG_IMAGE)
    .withDatabase(PG_DEFAULT_DATABASE)
    .withUsername(PG_USER)
    .withPassword(PG_PASSWORD)
    .start();

  writeContainerState({
    host: container.getHost(),
    port: container.getPort(),
    user: PG_USER,
    password: PG_PASSWORD,
    defaultDatabase: PG_DEFAULT_DATABASE,
    templateDatabase: PG_TEMPLATE_DATABASE,
  });

  await createTemplateDatabase();

  const databaseUrl = getTemplateDatabaseUrl();
  const env = buildE2eProcessEnv({
    DATABASE_URL: databaseUrl,
    DATABASE_URL_UNPOOLED: databaseUrl,
  });

  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  });

  execSync('pnpm exec tsx seeding/seed.ts', {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  });

  execSync('pnpm exec tsx e2e/seeding/seed-e2e.ts', {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  });

  const wroteCiEnvFile = !!process.env.CI;

  if (wroteCiEnvFile) {
    writeCiBuildEnvFile({
      DATABASE_URL: databaseUrl,
      DATABASE_URL_UNPOOLED: databaseUrl,
    });
  }
  execSync('pnpm build', {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  });

  return async () => {
    await container.stop();
    try {
      const { unlinkSync } = await import('node:fs');
      const { E2E_STATE_FILE } = await import('./constants');
      unlinkSync(E2E_STATE_FILE);
      if (wroteCiEnvFile) {
        unlinkSync(ROOT_ENV_FILE);
      }
    } catch {
      // ignore
    }
  };
}
