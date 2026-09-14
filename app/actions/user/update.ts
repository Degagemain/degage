import { AppError } from '@/actions/app.error';
import { Role } from '@/domain/role.model';
import { User, userSchema } from '@/domain/user.model';
import { dbUserCountActiveAdmins, dbUserRead } from '@/storage/user/user.read';
import { dbUserUpdate } from '@/storage/user/user.update';

const isActiveAdmin = (user: User): boolean => user.role === Role.ADMIN && user.banned !== true;

export const updateUser = async (user: User): Promise<User> => {
  const validated = userSchema.parse(user);
  const existing = await dbUserRead(validated.id);

  if (isActiveAdmin(existing) && !isActiveAdmin(validated)) {
    const activeAdminCount = await dbUserCountActiveAdmins();
    if (activeAdminCount <= 1) {
      throw new AppError('last_admin', 'Cannot remove the last remaining admin.', 409);
    }
  }

  return dbUserUpdate(validated);
};
