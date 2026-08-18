import type { EmailTemplate } from '@/domain/email-template.model';
import { getPrismaClient } from '@/storage/utils';
import { dbEmailTemplateToDomain } from './email-template.mappers';

export const dbEmailTemplateRead = async (id: string): Promise<EmailTemplate> => {
  const prisma = getPrismaClient();
  const template = await prisma.emailTemplate.findUniqueOrThrow({
    where: { id },
    include: { translations: true },
  });
  return dbEmailTemplateToDomain(template);
};

export const dbEmailTemplateGetByCode = async (code: string): Promise<EmailTemplate | null> => {
  const prisma = getPrismaClient();
  const template = await prisma.emailTemplate.findUnique({
    where: { code },
    include: { translations: true },
  });
  return template ? dbEmailTemplateToDomain(template) : null;
};
