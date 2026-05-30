import { type ChildProcess, spawn } from 'node:child_process';
import { createConnection } from 'node:net';

import { E2E_BASE_PORT } from '../constants';
import { buildNextProcessEnv } from './env';

const serversByWorker = new Map<number, ChildProcess>();

const serverReadyTimeoutMs = 120_000;

const waitForPort = (port: number, timeoutMs = serverReadyTimeoutMs): Promise<void> => {
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
          reject(new Error(`Timed out waiting for server on port ${port}`));
          return;
        }
        setTimeout(tryConnect, 250);
      });
    };
    tryConnect();
  });
};

export const getWorkerPort = (workerIndex: number): number => E2E_BASE_PORT + workerIndex;

export const startNextServer = async (workerIndex: number, databaseUrl: string): Promise<{ baseURL: string; port: number }> => {
  await stopNextServer(workerIndex);

  const port = getWorkerPort(workerIndex);
  const baseURL = `http://127.0.0.1:${port}`;
  const env = buildNextProcessEnv(databaseUrl, baseURL);

  const child = spawn('pnpm', ['exec', 'next', 'start', '-p', String(port)], {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serversByWorker.set(workerIndex, child);

  child.stdout?.on('data', (chunk: Buffer) => {
    if (process.env.E2E_DEBUG_SERVER) {
      process.stdout.write(chunk);
    }
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    if (process.env.E2E_DEBUG_SERVER) {
      process.stderr.write(chunk);
    }
  });

  child.on('exit', (code, signal) => {
    if (code !== null && code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
      console.error(`Next server for worker ${workerIndex} exited with code ${code}`);
    }
  });

  await waitForPort(port);
  return { baseURL, port };
};

export const stopNextServer = async (workerIndex: number): Promise<void> => {
  const child = serversByWorker.get(workerIndex);
  if (!child) {
    return;
  }
  serversByWorker.delete(workerIndex);

  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

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
