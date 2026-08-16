import { getPrismaClient } from '@/storage/utils';

export type DbUserAuthContext = {
  id: string;
  role: string | null;
  emailVerified: boolean;
  banned: boolean | null;
};

export const dbUserReadAuthContext = async (userId: string): Promise<DbUserAuthContext | null> => {
  const prisma = getPrismaClient();
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      emailVerified: true,
      banned: true,
    },
  });
};
