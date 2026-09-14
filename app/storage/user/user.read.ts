import { Role } from '@/domain/role.model';
import { User } from '@/domain/user.model';
import { getPrismaClient } from '@/storage/utils';
import { dbUserToDomain } from './user.mappers';

export async function dbUserGetLocale(userId: string): Promise<string | null> {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });

  return user?.locale ?? null;
}

export const dbUserRead = async (id: string): Promise<User> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });
  return dbUserToDomain(user);
};

export const dbUserCountActiveAdmins = async (): Promise<number> => {
  const prisma = getPrismaClient();
  return prisma.user.count({
    where: {
      role: Role.ADMIN,
      OR: [{ banned: false }, { banned: null }],
    },
  });
};

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
