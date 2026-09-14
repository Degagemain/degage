import { User } from '@/domain/user.model';
import { getPrismaClient } from '@/storage/utils';
import { dbUserToDomain, userToDbUpdate } from './user.mappers';

export async function dbUserUpdateLocale(userId: string, locale: string): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.user.update({
    where: { id: userId },
    data: { locale },
  });
}

export const dbUserUpdate = async (user: User): Promise<User> => {
  const prisma = getPrismaClient();
  const updated = await prisma.$transaction(async (tx) => {
    const nextUser = await tx.user.update({
      where: { id: user.id },
      data: userToDbUpdate(user),
    });
    if (user.banned === true) {
      await tx.session.deleteMany({ where: { userId: user.id } });
    }
    return nextUser;
  });
  return dbUserToDomain(updated);
};
