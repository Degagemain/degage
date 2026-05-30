import { E2E_ADMIN_EMAIL, E2E_AUTH_SECRET, E2E_PASSWORD, E2E_USER_EMAIL } from '../constants';
import { buildE2eProcessEnv } from './load-e2e-env';

export const buildNextProcessEnv = (databaseUrl: string, baseUrl: string): NodeJS.ProcessEnv => {
  return buildE2eProcessEnv({
    NODE_ENV: 'production',
    DATABASE_URL: databaseUrl,
    DATABASE_URL_UNPOOLED: databaseUrl,
    BETTER_AUTH_SECRET: E2E_AUTH_SECRET,
    BETTER_AUTH_URL: baseUrl,
    E2E_ADMIN_EMAIL,
    E2E_USER_EMAIL,
    E2E_PASSWORD,
  });
};
