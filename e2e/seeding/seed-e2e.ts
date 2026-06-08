import { auth } from '@/auth';
import { getPrismaClient } from '@/storage/utils';

import { seedE2eSimulationData } from './seed-e2e-simulation-data';

const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'password';

type E2eAccount = {
  email: string;
  role: 'admin' | 'user';
};

const accounts: E2eAccount[] = [
  { email: process.env.E2E_ADMIN_EMAIL ?? 'admin@e2e.test', role: 'admin' },
  { email: process.env.E2E_USER_EMAIL ?? 'user@e2e.test', role: 'user' },
];

async function ensureE2eAccount({ email, role }: E2eAccount) {
  const prisma = getPrismaClient();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`E2E account already exists: ${email}`);
    return;
  }

  const name = email.split('@')[0] ?? role;

  await auth.api.createUser({
    body: {
      email,
      password: E2E_PASSWORD,
      name,
      role,
    },
  });

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  console.log(`E2E account created: ${email} (role: ${role})`);
}

async function seedE2e() {
  for (const account of accounts) {
    await ensureE2eAccount(account);
  }
  await seedE2eSimulationData();
  await getPrismaClient().$disconnect();
}

seedE2e().catch((error) => {
  console.error('E2E seed failed:', error);
  process.exit(1);
});
