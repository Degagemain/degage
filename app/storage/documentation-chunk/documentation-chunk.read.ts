import { getPrismaClient } from '@/storage/utils';

type ExistingHashRow = {
  documentationId: string;
  contentHash: string;
};

export const dbDocumentationChunkReadHashesByLocale = async (locale: string): Promise<Map<string, string>> => {
  const prisma = getPrismaClient();
  const rows = (await prisma.$queryRaw`
    SELECT DISTINCT ON ("documentationId")
      "documentationId",
      "contentHash"
    FROM "DocumentationChunk"
    WHERE "locale" = ${locale}
    ORDER BY "documentationId", "createdAt" DESC
  `) as ExistingHashRow[];

  return new Map(rows.map((row) => [row.documentationId, row.contentHash]));
};
