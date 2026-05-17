import type { ContentLocale } from '@/i18n/locales';
import { Role } from '@/domain/role.model';
import { getPrismaClient } from '@/storage/utils';
import { DocumentationSource } from '@/storage/client/client';

export type NotionDocUpsertInput = {
  parentKey: string;
  translation: { locale: ContentLocale; title: string; content: string };
};

export const notionExternalId = (parentKey: string): string => {
  const normalized = parentKey.trim();
  return normalized.startsWith('notion:') ? normalized : `notion:${normalized}`;
};

export const dbDocumentationUpsertNotion = async (input: NotionDocUpsertInput): Promise<void> => {
  const prisma = getPrismaClient();
  const externalId = notionExternalId(input.parentKey);
  const existing = await prisma.documentation.findUnique({
    where: { externalId },
    select: { id: true },
  });

  if (!existing) {
    await prisma.documentation.create({
      data: {
        source: DocumentationSource.notion,
        externalId,
        isFaq: false,
        isPublic: false,
        format: 'markdown',
        audienceRoles: [Role.ADMIN],
        tags: [],
        translations: {
          create: {
            locale: input.translation.locale,
            title: input.translation.title,
            content: input.translation.content,
          },
        },
      },
    });
    return;
  }

  await prisma.documentationTranslation.upsert({
    where: {
      documentationId_locale: {
        documentationId: existing.id,
        locale: input.translation.locale,
      },
    },
    create: {
      documentationId: existing.id,
      locale: input.translation.locale,
      title: input.translation.title,
      content: input.translation.content,
    },
    update: {
      title: input.translation.title,
      content: input.translation.content,
    },
  });
};
