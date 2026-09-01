import { getPrismaClient } from '@/storage/utils';

export async function dbUserGetLocale(userId: string): Promise<string | null> {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });

  return user?.locale ?? null;
}

export type DbUserEmailAndLocale = {
  email: string;
  locale: string | null;
};

export async function dbUserReadEmailAndLocale(userId: string): Promise<DbUserEmailAndLocale | null> {
  const prisma = getPrismaClient();
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, locale: true },
  });
}
