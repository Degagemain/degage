import { type BrowserContext, test as base } from '@playwright/test';

import { createTestDatabase, dropTestDatabase, getTestDatabaseUrl } from './shared/db';
import { signInAsAdmin } from './shared/auth';
import { startNextServer, stopNextServer } from './shared/server';

const setEnglishLocale = async (context: BrowserContext, baseURL: string) => {
  const host = new URL(baseURL).hostname;
  await context.addCookies([{ name: 'locale', value: 'en', domain: host, path: '/' }]);
};

export type TestDbFixture = {
  name: string;
  databaseUrl: string;
};

export type AppServerFixture = {
  baseURL: string;
  port: number;
};

export const test = base.extend<{
  testDb: TestDbFixture;
  appServer: AppServerFixture;
  asAdmin: void;
}>({
  testDb: async ({}, use, testInfo) => {
    const name = await createTestDatabase(testInfo.parallelIndex, testInfo.testId);
    const databaseUrl = getTestDatabaseUrl(name);
    await use({ name, databaseUrl });
    await dropTestDatabase(name);
  },

  appServer: async ({ testDb }, use, testInfo) => {
    const server = await startNextServer(testInfo.parallelIndex, testDb.databaseUrl);
    await use(server);
    await stopNextServer(testInfo.parallelIndex);
  },

  page: async ({ page, context, appServer }, use) => {
    await setEnglishLocale(context, appServer.baseURL);
    await use(page);
  },

  asAdmin: async ({ appServer, context }, use) => {
    await signInAsAdmin(context, appServer.baseURL);
    await use();
  },
});

export { expect } from '@playwright/test';
