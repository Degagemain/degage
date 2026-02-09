import { getPrismaClient } from '@/storage/utils';

export async function dbUserGetLocale(userId: string): Promise<string | null> {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });

  return user?.locale ?? null;
}
