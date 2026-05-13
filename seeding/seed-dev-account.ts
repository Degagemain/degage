import { auth } from '@/auth';
import { getPrismaClient } from '@/storage/utils';

const DEV_PASSWORD = 'password';

async function seedDevAccount() {
  const email = process.env.DEV_ACCOUNT_EMAIL;
  if (!email) {
    console.error('DEV_ACCOUNT_EMAIL is not set. Skipping dev account seed.');
    process.exit(1);
  }

  const prisma = getPrismaClient();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Dev account already exists: ${email}`);
    await prisma.$disconnect();
    return;
  }

  const name = email.split('@')[0] ?? 'dev';

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
  await prisma.$disconnect();
}

seedDevAccount().catch((error) => {
  console.error('Dev account seed failed:', error);
  process.exit(1);
});
