import * as z from 'zod';
import type { EmailTemplate } from '@/domain/email-template.model';
import { emailTemplateSchema } from '@/domain/email-template.model';
import { dbEmailTemplateUpdate } from '@/storage/email-template/email-template.update';

export const updateEmailTemplate = async (template: EmailTemplate): Promise<EmailTemplate> => {
  const validated = emailTemplateSchema.parse(template);
  z.uuid().parse(validated.id);
  return dbEmailTemplateUpdate(validated);
};
