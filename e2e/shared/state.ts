import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { E2E_STATE_FILE } from '../constants';

export type ContainerState = {
  host: string;
  port: number;
  user: string;
  password: string;
  defaultDatabase: string;
  templateDatabase: string;
};

export const writeContainerState = (state: ContainerState): void => {
  mkdirSync(dirname(E2E_STATE_FILE), { recursive: true });
  writeFileSync(E2E_STATE_FILE, JSON.stringify(state, null, 2));
};

export const readContainerState = (): ContainerState => {
  const raw = readFileSync(E2E_STATE_FILE, 'utf8');
  return JSON.parse(raw) as ContainerState;
};
