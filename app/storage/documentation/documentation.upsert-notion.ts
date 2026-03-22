import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import type { DocumentationFormat } from '@/domain/documentation.model';
import type { DocumentationTag } from '@/domain/documentation.model';
import { getPrismaClient } from '@/storage/utils';
import { DocumentationSource } from '@/storage/client/client';

export type NotionDocUpsertInput = {
  notionPageId: string;
  isFaq: boolean;
  format: DocumentationFormat;
  audienceRoles: DocumentationAudienceRole[];
  tags: DocumentationTag[];
  translations: { locale: string; title: string; content: string }[];
};

export const notionExternalId = (pageId: string): string => `notion:${pageId}`;

export const dbDocumentationUpsertNotion = async (input: NotionDocUpsertInput): Promise<void> => {
  const prisma = getPrismaClient();
  const externalId = notionExternalId(input.notionPageId);
  await prisma.documentation.upsert({
    where: { externalId },
    create: {
      source: DocumentationSource.notion,
      externalId,
      isFaq: input.isFaq,
      format: input.format,
      audienceRoles: input.audienceRoles,
      tags: input.tags,
      translations: {
        createMany: {
          data: input.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            content: t.content,
          })),
        },
      },
    },
    update: {
      isFaq: input.isFaq,
      format: input.format,
      audienceRoles: input.audienceRoles,
      tags: input.tags,
      translations: {
        deleteMany: {},
        createMany: {
          data: input.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            content: t.content,
          })),
        },
      },
    },
  });
};
