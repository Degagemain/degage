import { userLocaleUpdateSchema } from '@/domain/user.model';
import { dbUserUpdateLocale } from '@/storage/user/user.update';

export const updateUserLocale = async (userId: string, locale: string): Promise<void> => {
  const validated = userLocaleUpdateSchema.parse({ locale });
  await dbUserUpdateLocale(userId, validated.locale);
};
