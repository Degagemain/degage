import { Role } from '@/domain/role.model';
import { getPrismaClient } from '@/storage/utils';

// TODO: replace oldest-admin lookup with a dedicated admin-mode play connector account.
export const dbUserReadOldestAdmin = async (): Promise<{ id: string } | null> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN,
      OR: [{ banned: false }, { banned: null }],
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return user;
};
