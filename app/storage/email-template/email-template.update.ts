import type { EmailTemplate } from '@/domain/email-template.model';
import { getPrismaClient } from '@/storage/utils';
import { dbEmailTemplateToDomain, emailTemplateToDbUpdate } from './email-template.mappers';

export const dbEmailTemplateUpdate = async (template: EmailTemplate): Promise<EmailTemplate> => {
  const prisma = getPrismaClient();
  const updated = await prisma.emailTemplate.update({
    where: { id: template.id! },
    data: emailTemplateToDbUpdate(template),
    include: { translations: true },
  });
  return dbEmailTemplateToDomain(updated);
};
