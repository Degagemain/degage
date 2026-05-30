import { loadE2eEnvIntoProcess } from './shared/load-e2e-env';

loadE2eEnvIntoProcess();

export const PG_IMAGE = 'pgvector/pgvector:pg16';
export const PG_USER = 'postgres';
export const PG_PASSWORD = 'postgres';
export const PG_DEFAULT_DATABASE = 'e2e';
export const PG_TEMPLATE_DATABASE = 'e2e_template';

export const E2E_BASE_PORT = 3100;

export const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
export const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL!;
export const E2E_PASSWORD = process.env.E2E_PASSWORD!;

export const E2E_STATE_FILE = 'e2e/.container-state.json';

export const E2E_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
