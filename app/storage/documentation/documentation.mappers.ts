import type {
  Documentation,
  DocumentationAudienceRole,
  DocumentationFormat,
  DocumentationSource,
  DocumentationTag,
} from '@/domain/documentation.model';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';
import { getRequestContentLocale } from '@/context/request-context';
import { Prisma } from '@/storage/client/client';

const pickGroupName = (translations: { locale: string; name: string }[], locale: ContentLocale): string => {
  const t = translations.find((x) => x.locale === locale) ?? translations.find((x) => x.locale === defaultContentLocale) ?? translations[0];
  return t?.name ?? '';
};

export type DocumentationWithRelations = Prisma.DocumentationGetPayload<{
  include: { translations: true; groups: { include: { translations: true } } };
}>;

export const dbDocumentationToDomain = (row: DocumentationWithRelations, locale: ContentLocale = getRequestContentLocale()): Documentation => {
  const sortedGroups = [...row.groups].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: row.id,
    source: row.source as DocumentationSource,
    externalId: row.externalId,
    isFaq: row.isFaq,
    isPublic: row.isPublic,
    format: row.format as DocumentationFormat,
    audienceRoles: row.audienceRoles as DocumentationAudienceRole[],
    tags: row.tags as DocumentationTag[],
    groups: sortedGroups.map((g) => ({
      id: g.id,
      name: pickGroupName(g.translations, locale),
    })),
    translations: row.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      content: t.content,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const documentationToDbCreate = (doc: Documentation): Prisma.DocumentationCreateInput => {
  return {
    source: doc.source,
    externalId: doc.externalId,
    isFaq: doc.isFaq,
    isPublic: doc.isPublic,
    format: doc.format,
    audienceRoles: doc.audienceRoles,
    tags: doc.tags,
    ...(doc.groups.length > 0
      ? {
          groups: {
            connect: doc.groups.map((g) => ({ id: g.id })),
          },
        }
      : {}),
    translations: {
      createMany: {
        data: doc.translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          content: t.content,
        })),
      },
    },
  };
};

export const documentationToDbUpdate = (doc: Documentation): Prisma.DocumentationUpdateInput => {
  return {
    source: doc.source,
    externalId: doc.externalId,
    isFaq: doc.isFaq,
    isPublic: doc.isPublic,
    format: doc.format,
    audienceRoles: doc.audienceRoles,
    tags: doc.tags,
    groups: {
      set: doc.groups.map((g) => ({ id: g.id })),
    },
    translations: {
      deleteMany: {},
      createMany: {
        data: doc.translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          content: t.content,
        })),
      },
    },
  };
};
