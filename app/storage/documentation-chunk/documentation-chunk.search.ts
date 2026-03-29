import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import { documentationAdminOnlyAudiences, documentationViewerHasPrivilegedDocSearchAccess } from '@/domain/documentation-audience.utils';
import { getPrismaClient, toVectorLiteral } from '@/storage/utils';
import { dbDocumentationChunkEnsureVectorSupport } from './documentation-chunk.ensure';

export type DocumentationChunkSearchResult = {
  chunkId: string;
  documentationId: string;
  externalId: string;
  title: string;
  content: string;
  similarity: number;
};

type DocumentationChunkSearchRow = {
  chunkId: string;
  documentationId: string;
  externalId: string;
  title: string;
  content: string;
  similarity: number;
};

type SearchOptions = {
  limit: number;
  locale: string;
  viewerAudienceRole: DocumentationAudienceRole;
};

export const dbDocumentationChunkSearch = async (embedding: number[], options: SearchOptions): Promise<DocumentationChunkSearchResult[]> => {
  const prisma = getPrismaClient();
  await dbDocumentationChunkEnsureVectorSupport();
  const vectorLiteral = toVectorLiteral(embedding);

  const mayAccessAdminAudienceDocs = documentationViewerHasPrivilegedDocSearchAccess(options.viewerAudienceRole);
  const adminOnlyAudiencesSql = documentationAdminOnlyAudiences.map((audienceRole) => `'${audienceRole}'`).join(',');

  const rows = (await prisma.$queryRawUnsafe(
    `
      SELECT
        dc.id AS "chunkId",
        dc."documentationId",
        d."externalId",
        dt.title,
        dc.content,
        1 - (dc.embedding <=> CAST($1 AS vector)) AS similarity
      FROM "DocumentationChunk" dc
      INNER JOIN "Documentation" d ON d.id = dc."documentationId"
      INNER JOIN "DocumentationTranslation" dt
        ON dt."documentationId" = d.id
       AND dt.locale = $2
      WHERE dc.locale = $2
        AND ($3::boolean = true OR NOT (d."audienceRoles" && ARRAY[${adminOnlyAudiencesSql}]::"DocumentationAudienceRole"[]))
      ORDER BY dc.embedding <=> CAST($1 AS vector)
      LIMIT $4
    `,
    vectorLiteral,
    options.locale,
    mayAccessAdminAudienceDocs,
    options.limit,
  )) as DocumentationChunkSearchRow[];

  return rows.map((row) => ({
    chunkId: row.chunkId,
    documentationId: row.documentationId,
    externalId: row.externalId,
    title: row.title,
    content: row.content,
    similarity: Number(row.similarity),
  }));
};
