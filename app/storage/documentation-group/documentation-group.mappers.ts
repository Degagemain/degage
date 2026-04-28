import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type DocumentationGroupWithTranslations = Prisma.DocumentationGroupGetPayload<{ include: { translations: true } }>;

export const dbDocumentationGroupToDomain = (row: DocumentationGroupWithTranslations, locale: ContentLocale): DocumentationGroup => {
  const translation =
    row.translations.find((t) => t.locale === locale) ?? row.translations.find((t) => t.locale === defaultContentLocale) ?? row.translations[0];

  return {
    id: row.id,
    order: row.sortOrder,
    name: translation?.name ?? '',
    translations: row.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const documentationGroupToDbCreate = (group: DocumentationGroup): Prisma.DocumentationGroupCreateInput => {
  return {
    sortOrder: group.order,
    translations: {
      createMany: {
        data: group.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};

export const documentationGroupToDbUpdate = (group: DocumentationGroup): Prisma.DocumentationGroupUpdateInput => {
  return {
    sortOrder: group.order,
    translations: {
      deleteMany: {},
      createMany: {
        data: group.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};
