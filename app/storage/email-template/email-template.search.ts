import type { EmailTemplate } from '@/domain/email-template.model';
import type { EmailTemplateFilter } from '@/domain/email-template.filter';
import { Page } from '@/domain/page.model';
import { getPrismaClient } from '@/storage/utils';
import { Prisma } from '@/storage/client/client';
import { dbEmailTemplateToDomain } from './email-template.mappers';

export const filterToQuery = (filter: EmailTemplateFilter): Prisma.EmailTemplateWhereInput => {
  const query = filter.query?.trim();
  if (!query) {
    return {};
  }
  return {
    OR: [{ code: { contains: query, mode: 'insensitive' } }, { designId: { contains: query, mode: 'insensitive' } }],
  };
};

export const dbEmailTemplateSearch = async (filter: EmailTemplateFilter): Promise<Page<EmailTemplate>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.emailTemplate.count({ where: whereClause });
  const templates = await prisma.emailTemplate.findMany({
    where: whereClause,
    include: { translations: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: templates.map(dbEmailTemplateToDomain),
    total,
  };
};
