import type { EmailTemplate } from '@/domain/email-template.model';
import { emailTemplateSchema } from '@/domain/email-template.model';
import { dbEmailTemplateCreate } from '@/storage/email-template/email-template.create';

export const createEmailTemplate = async (template: EmailTemplate): Promise<EmailTemplate> => {
  const validated = emailTemplateSchema.parse(template);
  return dbEmailTemplateCreate(validated);
};
