import { createHash } from 'node:crypto';

import { Client } from 'pg';

import { PG_DEFAULT_DATABASE, PG_PASSWORD, PG_TEMPLATE_DATABASE, PG_USER } from '../constants';
import { type ContainerState, readContainerState } from './state';

const quoteIdent = (name: string): string => `"${name.replace(/"/g, '""')}"`;

export const buildDatabaseUrl = (state: ContainerState, database: string): string => {
  const { host, port, user, password } = state;
  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
};

const adminClient = async (database = 'postgres'): Promise<Client> => {
  const state = readContainerState();
  const client = new Client({
    host: state.host,
    port: state.port,
    user: state.user,
    password: state.password,
    database,
  });
  await client.connect();
  return client;
};

export const terminateConnections = async (database: string): Promise<void> => {
  const client = await adminClient('postgres');
  try {
    await client.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()', [database]);
  } finally {
    await client.end();
  }
};

export const createTemplateDatabase = async (): Promise<void> => {
  const state = readContainerState();
  const client = await adminClient('postgres');
  try {
    await terminateConnections(PG_TEMPLATE_DATABASE);
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(PG_TEMPLATE_DATABASE)}`);
    await client.query(`CREATE DATABASE ${quoteIdent(PG_TEMPLATE_DATABASE)} OWNER ${quoteIdent(state.user)}`);
  } finally {
    await client.end();
  }
};

export const sanitizeTestDatabaseName = (workerIndex: number, testId: string): string => {
  const hash = createHash('sha256').update(testId).digest('hex').slice(0, 16);
  return `e2e_w${workerIndex}_${hash}`;
};

export const createTestDatabase = async (workerIndex: number, testId: string): Promise<string> => {
  const state = readContainerState();
  const name = sanitizeTestDatabaseName(workerIndex, testId);
  await terminateConnections(PG_TEMPLATE_DATABASE);
  const client = await adminClient('postgres');
  try {
    await terminateConnections(name);
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(name)}`);
    await client.query(`CREATE DATABASE ${quoteIdent(name)} WITH TEMPLATE ${quoteIdent(PG_TEMPLATE_DATABASE)} OWNER ${quoteIdent(state.user)}`);
  } finally {
    await client.end();
  }
  return name;
};

export const dropTestDatabase = async (name: string): Promise<void> => {
  const client = await adminClient('postgres');
  try {
    await terminateConnections(name);
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(name)}`);
  } finally {
    await client.end();
  }
};

export const getTestDatabaseUrl = (name: string): string => {
  return buildDatabaseUrl(readContainerState(), name);
};

export const getTemplateDatabaseUrl = (): string => {
  return buildDatabaseUrl(readContainerState(), PG_TEMPLATE_DATABASE);
};

export const getDefaultDatabaseUrl = (): string => {
  return buildDatabaseUrl(readContainerState(), PG_DEFAULT_DATABASE);
};
