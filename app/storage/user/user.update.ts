import { getPrismaClient } from '@/storage/utils';

export async function dbUserUpdateLocale(userId: string, locale: string): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.user.update({
    where: { id: userId },
    data: { locale },
  });
}
