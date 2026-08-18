import { dbEmailTemplateDelete } from '@/storage/email-template/email-template.delete';

export const deleteEmailTemplate = async (id: string): Promise<void> => {
  await dbEmailTemplateDelete(id);
};
