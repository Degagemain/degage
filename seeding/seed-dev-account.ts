import { pathToFileURL } from 'node:url';

import { auth } from '@/auth';
import { getPrismaClient } from '@/storage/utils';

const DEV_PASSWORD = 'password';

export type SeedDevAccountResult = 'created' | 'exists' | 'missing-email';

export async function seedDevAccount(): Promise<SeedDevAccountResult> {
  const email = process.env.DEV_ACCOUNT_EMAIL?.trim();
  if (!email) {
    return 'missing-email';
  }

  const prisma = getPrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`Dev account already exists: ${email}`);
      return 'exists';
    }

    const localPart = email.split('@')[0] ?? 'dev';
    const name = localPart.split('+').pop() || localPart;

    await auth.api.createUser({
      body: {
        email,
        password: DEV_PASSWORD,
        name,
        role: 'admin',
      },
    });

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    console.log(`Dev account created: ${email} (password: ${DEV_PASSWORD})`);
    return 'created';
  } finally {
    await prisma.$disconnect();
  }
}

const ranAsCli = process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;

if (ranAsCli) {
  seedDevAccount()
    .then((result) => {
      if (result === 'missing-email') {
        console.error('DEV_ACCOUNT_EMAIL is not set. Skipping dev account seed.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Dev account seed failed:', error);
      process.exit(1);
    });
}
