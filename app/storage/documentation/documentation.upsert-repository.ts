import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import type { DocumentationFormat } from '@/domain/documentation.model';
import type { DocumentationTag } from '@/domain/documentation.model';
import { getPrismaClient } from '@/storage/utils';
import { DocumentationSource } from '@/storage/client/client';

export type RepositoryDocUpsertInput = {
  externalId: string;
  isFaq: boolean;
  isPublic: boolean;
  format: DocumentationFormat;
  audienceRoles: DocumentationAudienceRole[];
  tags: DocumentationTag[];
  translations: { locale: string; title: string; content: string }[];
};

export type RepositoryDocUpsertResult = 'created' | 'updated' | 'unchanged';

type ExistingRepositoryDoc = {
  isFaq: boolean;
  isPublic: boolean;
  format: string;
  audienceRoles: string[];
  tags: string[];
  translations: { locale: string; title: string; content: string }[];
};

const sameSortedStrings = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
};

const sameTranslations = (
  existing: { locale: string; title: string; content: string }[],
  incoming: { locale: string; title: string; content: string }[],
): boolean => {
  if (existing.length !== incoming.length) {
    return false;
  }
  const byLocale = new Map(existing.map((t) => [t.locale, t]));
  return incoming.every((t) => {
    const prev = byLocale.get(t.locale);
    return prev !== undefined && prev.title === t.title && prev.content === t.content;
  });
};

export const isRepositoryDocUnchanged = (existing: ExistingRepositoryDoc, input: RepositoryDocUpsertInput): boolean => {
  return (
    existing.isFaq === input.isFaq &&
    existing.isPublic === input.isPublic &&
    existing.format === input.format &&
    sameSortedStrings(existing.audienceRoles, input.audienceRoles) &&
    sameSortedStrings(existing.tags, input.tags) &&
    sameTranslations(existing.translations, input.translations)
  );
};

const translationCreateData = (input: RepositoryDocUpsertInput) =>
  input.translations.map((t) => ({
    locale: t.locale,
    title: t.title,
    content: t.content,
  }));

export const dbDocumentationUpsertRepository = async (input: RepositoryDocUpsertInput): Promise<RepositoryDocUpsertResult> => {
  const prisma = getPrismaClient();
  const existing = await prisma.documentation.findUnique({
    where: { externalId: input.externalId },
    include: { translations: true },
  });

  if (!existing) {
    await prisma.documentation.create({
      data: {
        source: DocumentationSource.repository,
        externalId: input.externalId,
        isFaq: input.isFaq,
        isPublic: input.isPublic,
        format: input.format,
        audienceRoles: input.audienceRoles,
        tags: input.tags,
        translations: {
          createMany: {
            data: translationCreateData(input),
          },
        },
      },
    });
    return 'created';
  }

  if (isRepositoryDocUnchanged(existing, input)) {
    return 'unchanged';
  }

  await prisma.documentation.update({
    where: { externalId: input.externalId },
    data: {
      isFaq: input.isFaq,
      isPublic: input.isPublic,
      format: input.format,
      audienceRoles: input.audienceRoles,
      tags: input.tags,
      translations: {
        deleteMany: {},
        createMany: {
          data: translationCreateData(input),
        },
      },
    },
  });
  return 'updated';
};

export const dbDocumentationDeleteRepositoryNotIn = async (externalIds: string[]): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.documentation.deleteMany({
    where: {
      source: DocumentationSource.repository,
      externalId: { notIn: externalIds },
    },
  });
};
