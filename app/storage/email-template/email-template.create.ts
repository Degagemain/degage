import type { EmailTemplate } from '@/domain/email-template.model';
import { getPrismaClient } from '@/storage/utils';
import { dbEmailTemplateToDomain, emailTemplateToDbCreate } from './email-template.mappers';

export const dbEmailTemplateCreate = async (template: EmailTemplate): Promise<EmailTemplate> => {
  const prisma = getPrismaClient();
  const created = await prisma.emailTemplate.create({
    data: emailTemplateToDbCreate(template),
    include: { translations: true },
  });
  return dbEmailTemplateToDomain(created);
};
