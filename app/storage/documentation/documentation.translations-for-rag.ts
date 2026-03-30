import { getPrismaClient } from '@/storage/utils';

export type DocumentationTranslationForRag = {
  documentationId: string;
  locale: string;
  title: string;
  content: string;
};

export const dbDocumentationTranslationsForRagPairs = async (
  pairs: readonly { documentationId: string; locale: string }[],
): Promise<Map<string, DocumentationTranslationForRag>> => {
  if (pairs.length === 0) {
    return new Map();
  }

  const prisma = getPrismaClient();
  const rows = await prisma.documentationTranslation.findMany({
    where: {
      OR: pairs.map((pair) => ({
        documentationId: pair.documentationId,
        locale: pair.locale,
      })),
    },
  });

  const map = new Map<string, DocumentationTranslationForRag>();
  for (const row of rows) {
    map.set(row.documentationId, {
      documentationId: row.documentationId,
      locale: row.locale,
      title: row.title,
      content: row.content,
    });
  }

  return map;
};
