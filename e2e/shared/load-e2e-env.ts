import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const E2E_ENV_FILE = resolve(process.cwd(), 'e2e', '.env.e2e');
export const ROOT_ENV_FILE = resolve(process.cwd(), '.env');

export const parseEnvFile = (content: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
};

export const readE2eEnvFile = (): Record<string, string> => {
  if (!existsSync(E2E_ENV_FILE)) {
    throw new Error(`Missing ${E2E_ENV_FILE}. Create it for E2E runs (see README E2E section).`);
  }
  return parseEnvFile(readFileSync(E2E_ENV_FILE, 'utf8'));
};

export const loadE2eEnvIntoProcess = (): Record<string, string> => {
  const fileEnv = readE2eEnvFile();
  for (const [key, value] of Object.entries(fileEnv)) {
    process.env[key] = value;
  }
  return fileEnv;
};

export const buildE2eProcessEnv = (overrides: Record<string, string> = {}): NodeJS.ProcessEnv => {
  const fileEnv = readE2eEnvFile();
  return {
    ...process.env,
    ...fileEnv,
    ...overrides,
  };
};

const formatEnvFileLine = (key: string, value: string): string => {
  if (value === '') return `${key}=`;
  if (/[\s#"'\\]/.test(value)) return `${key}=${JSON.stringify(value)}`;
  return `${key}=${value}`;
};

/** Next and other tools read `.env` from disk; CI has no gitignored `.env`, so we write one before `next build`. */
export const writeCiBuildEnvFile = (overrides: Record<string, string> = {}): void => {
  const fileEnv = readE2eEnvFile();
  const merged = { ...fileEnv, ...overrides };
  const content = Object.entries(merged)
    .map(([key, value]) => formatEnvFileLine(key, value))
    .join('\n');
  writeFileSync(ROOT_ENV_FILE, `${content}\n`, 'utf8');
};
