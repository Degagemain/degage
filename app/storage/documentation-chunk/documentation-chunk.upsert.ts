import { randomUUID } from 'node:crypto';
import { Prisma } from '@/storage/client/client';
import type { DocumentationChunkUpsertItem } from '@/domain/documentation-chunk.model';
import { getPrismaClient, toVectorLiteral } from '@/storage/utils';
import { dbDocumentationChunkEnsureVectorSupport } from './documentation-chunk.ensure';

export const dbDocumentationChunkReplaceForLocale = async (
  documentationId: string,
  locale: string,
  chunks: DocumentationChunkUpsertItem[],
): Promise<void> => {
  const prisma = getPrismaClient();
  await dbDocumentationChunkEnsureVectorSupport();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      DELETE FROM "DocumentationChunk"
      WHERE "documentationId" = ${documentationId}
        AND "locale" = ${locale}
    `;

    for (const chunk of chunks) {
      const embeddingLiteral = toVectorLiteral(chunk.embedding);
      await tx.$executeRaw(
        Prisma.sql`
          INSERT INTO "DocumentationChunk" (
            "id",
            "documentationId",
            "locale",
            "chunkIndex",
            "chunkType",
            "content",
            "contentHash",
            "embedding",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${randomUUID()},
            ${chunk.documentationId},
            ${chunk.locale},
            ${chunk.chunkIndex},
            ${chunk.chunkType},
            ${chunk.content},
            ${chunk.contentHash},
            CAST(${embeddingLiteral} AS vector),
            NOW(),
            NOW()
          )
        `,
      );
    }
  });
};
