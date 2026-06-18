import { type ChildProcess, execSync, spawn } from 'node:child_process';
import { createConnection } from 'node:net';

import { PostgreSqlContainer } from '@testcontainers/postgresql';

import { PG_DEFAULT_DATABASE, PG_IMAGE, PG_PASSWORD, PG_TEMPLATE_DATABASE, PG_USER } from './constants';
import { ROOT_ENV_FILE, buildE2eProcessEnv, writeCiBuildEnvFile } from './shared/load-e2e-env';
import { createTemplateDatabase, getTemplateDatabaseUrl } from './shared/db';
import { writeContainerState } from './shared/state';

const playMockReadyTimeoutMs = 30_000;

const waitForPort = (port: number, timeoutMs = playMockReadyTimeoutMs): Promise<void> => {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = createConnection({ port, host: '127.0.0.1' });
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for Play mock on port ${port}`));
          return;
        }
        setTimeout(tryConnect, 250);
      });
    };
    tryConnect();
  });
};

const startPlayMockProcess = async (): Promise<ChildProcess> => {
  const port = Number(process.env.PLAY_MOCK_PORT ?? 3199);
  const child = spawn('pnpm', ['exec', 'tsx', 'e2e/play-mock/server.ts'], {
    stdio: 'pipe',
    env: buildE2eProcessEnv(),
    cwd: process.cwd(),
  });

  child.on('error', (error) => {
    console.error('Play mock process error:', error);
  });

  await waitForPort(port);
  return child;
};

const stopPlayMockProcess = async (child: ChildProcess): Promise<void> => {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      resolve();
    }, 5_000);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
};

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

  const playMock = await startPlayMockProcess();

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
    await stopPlayMockProcess(playMock);
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
