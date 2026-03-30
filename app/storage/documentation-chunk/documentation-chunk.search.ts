import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import { documentationAdminOnlyAudiences, documentationViewerHasPrivilegedDocSearchAccess } from '@/domain/documentation-audience.utils';
import { type ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { getPrismaClient, toVectorLiteral } from '@/storage/utils';
import { dbDocumentationChunkEnsureVectorSupport } from './documentation-chunk.ensure';

const normalizeChunkSearchLocales = (locales: string[]): ContentLocale[] => {
  const unique = [...new Set(locales)].filter((l): l is ContentLocale => contentLocales.includes(l as ContentLocale));
  return unique.length > 0 ? unique : [defaultContentLocale];
};

export type DocumentationChunkSearchResult = {
  chunkId: string;
  documentationId: string;
  externalId: string;
  title: string;
  content: string;
  locale: string;
  similarity: number;
};

type DocumentationChunkSearchRow = {
  chunkId: string;
  documentationId: string;
  externalId: string;
  title: string;
  content: string;
  locale: string;
  similarity: number;
};

type SearchOptions = {
  limit: number;
  locales: string[];
  viewerAudienceRole: DocumentationAudienceRole;
};

export const dbDocumentationChunkSearch = async (embedding: number[], options: SearchOptions): Promise<DocumentationChunkSearchResult[]> => {
  const prisma = getPrismaClient();
  await dbDocumentationChunkEnsureVectorSupport();
  const vectorLiteral = toVectorLiteral(embedding);

  const locales = normalizeChunkSearchLocales(options.locales);
  const localeListSql = locales.map((l) => `'${l}'`).join(', ');

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
        dc.locale AS "locale",
        1 - (dc.embedding <=> CAST($1 AS vector)) AS similarity
      FROM "DocumentationChunk" dc
      INNER JOIN "Documentation" d ON d.id = dc."documentationId"
      INNER JOIN "DocumentationTranslation" dt
        ON dt."documentationId" = d.id
       AND dt.locale = dc.locale
      WHERE dc.locale IN (${localeListSql})
        AND ($2::boolean = true OR NOT (d."audienceRoles" && ARRAY[${adminOnlyAudiencesSql}]::"DocumentationAudienceRole"[]))
      ORDER BY dc.embedding <=> CAST($1 AS vector)
      LIMIT $3
    `,
    vectorLiteral,
    mayAccessAdminAudienceDocs,
    options.limit,
  )) as DocumentationChunkSearchRow[];

  return rows.map((row) => ({
    chunkId: row.chunkId,
    documentationId: row.documentationId,
    externalId: row.externalId,
    title: row.title,
    content: row.content,
    locale: row.locale,
    similarity: Number(row.similarity),
  }));
};
