import type {
  Documentation,
  DocumentationAudienceRole,
  DocumentationFormat,
  DocumentationSource,
  DocumentationTag,
} from '@/domain/documentation.model';
import { Prisma } from '@/storage/client/client';

export type DocumentationWithTranslations = Prisma.DocumentationGetPayload<{ include: { translations: true } }>;

export const dbDocumentationToDomain = (row: DocumentationWithTranslations): Documentation => {
  return {
    id: row.id,
    source: row.source as DocumentationSource,
    externalId: row.externalId,
    isFaq: row.isFaq,
    format: row.format as DocumentationFormat,
    audienceRoles: row.audienceRoles as DocumentationAudienceRole[],
    tags: row.tags as DocumentationTag[],
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
    format: doc.format,
    audienceRoles: doc.audienceRoles,
    tags: doc.tags,
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
    format: doc.format,
    audienceRoles: doc.audienceRoles,
    tags: doc.tags,
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
