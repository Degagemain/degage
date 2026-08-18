import type { EmailTemplate, EmailTemplateTranslation } from '@/domain/email-template.model';
import type { Prisma } from '@/storage/client/client';

type EmailTemplateWithTranslations = Prisma.EmailTemplateGetPayload<{ include: { translations: true } }>;

const jsonToStringRecord = (value: Prisma.JsonValue): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, entry == null ? '' : String(entry)]));
};

export const dbEmailTemplateToDomain = (row: EmailTemplateWithTranslations): EmailTemplate => ({
  id: row.id,
  code: row.code as EmailTemplate['code'],
  designId: row.designId,
  translations: row.translations.map(
    (translation): EmailTemplateTranslation => ({
      locale: translation.locale,
      variables: jsonToStringRecord(translation.variables),
    }),
  ),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const emailTemplateToDbCreate = (template: EmailTemplate): Prisma.EmailTemplateCreateInput => ({
  code: template.code,
  designId: template.designId,
  translations: {
    createMany: {
      data: template.translations.map((translation) => ({
        locale: translation.locale,
        variables: translation.variables,
      })),
    },
  },
});

export const emailTemplateToDbUpdate = (template: EmailTemplate): Prisma.EmailTemplateUpdateInput => ({
  code: template.code,
  designId: template.designId,
  translations: {
    deleteMany: {},
    createMany: {
      data: template.translations.map((translation) => ({
        locale: translation.locale,
        variables: translation.variables,
      })),
    },
  },
});
