import { User } from '@/domain/user.model';
import { dbUserRead } from '@/storage/user/user.read';

export const readUser = async (id: string): Promise<User> => {
  return dbUserRead(id);
};
