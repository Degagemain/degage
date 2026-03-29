import type { Prisma } from '@/storage/client/client';

export type TranslationContentHashRow = {
  locale: string;
  title: string;
  content: string;
  contentHash: string | null;
};

export type TranslationUpsertInput = {
  locale: string;
  title: string;
  content: string;
};

export const mergeTranslationRowsWithPreservedContentHash = (
  existing: TranslationContentHashRow[],
  incoming: TranslationUpsertInput[],
): Prisma.DocumentationTranslationCreateManyDocumentationInput[] => {
  return incoming.map((t) => {
    const prev = existing.find((e) => e.locale === t.locale);
    const preserve = prev !== undefined && prev.title === t.title && prev.content === t.content;
    return {
      locale: t.locale,
      title: t.title,
      content: t.content,
      contentHash: preserve ? prev.contentHash : null,
    };
  });
};
