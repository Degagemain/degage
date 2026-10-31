import { getPrismaClient } from '@/storage/utils';

const DEV_PASSWORD = 'password';

async function checkDevAccount(): Promise<void> {
  const email = process.env.DEV_ACCOUNT_EMAIL?.trim();
  if (!email) {
    return;
  }

  const prisma = getPrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`You can login with ${email} and password "${DEV_PASSWORD}"`);
      return;
    }

    console.log(`Dev account ${email} not found. Run pnpm db:seed-dev-account to create it.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Could not check dev account: ${message}`);
  } finally {
    await prisma.$disconnect();
  }
}

checkDevAccount().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Could not check dev account: ${message}`);
});
