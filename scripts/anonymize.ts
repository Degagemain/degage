import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hashPassword } from 'better-auth/crypto';
import { Client } from 'pg';

import { anonymizeRefusedReason } from './anonymize-guard';

const previewPassword = 'password';

const sqlPath = join(dirname(fileURLToPath(import.meta.url)), 'anonymize.sql');

const connectionString = (): string => {
  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
};

const anonymizeDatabase = async (): Promise<void> => {
  const passwordHash = await hashPassword(previewPassword);
  const client = new Client({ connectionString: connectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE anonymize_config (dev_email text NOT NULL, password_hash text NOT NULL)');
    await client.query('INSERT INTO anonymize_config (dev_email, password_hash) VALUES ($1, $2)', [
      process.env.DEV_ACCOUNT_EMAIL?.trim() ?? '',
      passwordHash,
    ]);
    await client.query(readFileSync(sqlPath, 'utf8'));
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // The connection may already be closed.
    }
    throw error;
  } finally {
    await client.end();
  }
};

const main = async (): Promise<void> => {
  const reason = anonymizeRefusedReason(process.env.VERCEL_ENV, process.argv.includes('--force'));
  if (reason) {
    console.error(reason);
    process.exitCode = 1;
    return;
  }

  await anonymizeDatabase();

  const { seedDevAccount } = await import('../seeding/seed-dev-account');
  const seeded = await seedDevAccount();
  if (seeded === 'missing-email') {
    console.log('DEV_ACCOUNT_EMAIL is not set. No dev admin was created.');
  }
};

main().catch((error) => {
  console.error('Anonymize failed:', error);
  process.exitCode = 1;
});
