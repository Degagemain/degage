import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import type { DocumentationFormat } from '@/domain/documentation.model';
import type { DocumentationTag } from '@/domain/documentation.model';
import { getPrismaClient } from '@/storage/utils';
import { DocumentationSource } from '@/storage/client/client';

export type ManualDocUpsertInput = {
  externalId: string;
  isFaq: boolean;
  isPublic: boolean;
  format: DocumentationFormat;
  audienceRoles: DocumentationAudienceRole[];
  tags: DocumentationTag[];
  translations: { locale: string; title: string; content: string }[];
};

export const dbDocumentationUpsertManual = async (input: ManualDocUpsertInput): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.documentation.upsert({
    where: { externalId: input.externalId },
    create: {
      source: DocumentationSource.manual,
      externalId: input.externalId,
      isFaq: input.isFaq,
      isPublic: input.isPublic,
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
      isPublic: input.isPublic,
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
