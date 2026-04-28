import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import type { DocumentationSupportCitation } from '@/domain/documentation.support-citations';
import { getRequestContentLocale } from '@/context/request-context';
import { getSupportReplyToEmail } from '@/actions/utils';
import { type ContentLocale } from '@/i18n/locales';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationChunkSearch } from '@/storage/documentation-chunk/documentation-chunk.search';
import { dbDocumentationTranslationsForRagPairs } from '@/storage/documentation/documentation.translations-for-rag';

const DEFAULT_CHUNK_SEARCH_LIMIT = 30;
const DEFAULT_MAX_FULL_DOCUMENTS = 5;

export type RagDocumentationFullDocument = {
  documentationId: string;
  externalId: string;
  locale: string;
  title: string;
  content: string;
  bestChunkSimilarity: number;
  citationUrl: string;
  isPublic: boolean;
};

type SearchRagOptions = {
  viewerAudienceRole: DocumentationAudienceRole;
  /** Max vector hits to retrieve before grouping by document. Default 30. */
  limit?: number;
  /** Max full articles to return after ranking documents by their best chunk score. Default 5. */
  maxFullDocuments?: number;
  locales?: readonly ContentLocale[];
};

type DocBestChunkMeta = {
  similarity: number;
  locale: string;
  externalId: string;
  isPublic: boolean;
};

export const searchDocumentationForRag = async (
  query: string,
  options: SearchRagOptions,
): Promise<{
  fullDocuments: RagDocumentationFullDocument[];
  citations: DocumentationSupportCitation[];
  noResults: boolean;
  noResultsGuidance: string | null;
}> => {
  const locales = options.locales && options.locales.length > 0 ? options.locales : [getRequestContentLocale()];
  const queryEmbedding = await generateEmbedding(query, 'RETRIEVAL_QUERY');
  const chunkLimit = options.limit ?? DEFAULT_CHUNK_SEARCH_LIMIT;
  const maxFullDocuments = options.maxFullDocuments ?? DEFAULT_MAX_FULL_DOCUMENTS;

  const rows = await dbDocumentationChunkSearch(queryEmbedding, {
    viewerAudienceRole: options.viewerAudienceRole,
    limit: chunkLimit,
    locales: [...locales],
  });

  if (rows.length === 0) {
    return {
      fullDocuments: [],
      citations: [],
      noResults: true,
      noResultsGuidance:
        'No relevant documentation chunks were found. Respond helpfully: say you could not find matching docs, ' +
        'ask one clarifying question, and suggest rephrasing.',
    };
  }

  const bestByDoc = new Map<string, DocBestChunkMeta>();
  for (const row of rows) {
    const prev = bestByDoc.get(row.documentationId);
    if (!prev || row.similarity > prev.similarity) {
      bestByDoc.set(row.documentationId, {
        similarity: row.similarity,
        locale: row.locale,
        externalId: row.externalId,
        isPublic: row.isPublic,
      });
    }
  }

  const ranked = [...bestByDoc.entries()].sort((a, b) => b[1].similarity - a[1].similarity);
  const top = ranked.slice(0, maxFullDocuments);

  const translationMap = await dbDocumentationTranslationsForRagPairs(
    top.map(([documentationId, meta]) => ({ documentationId, locale: meta.locale })),
  );

  const fullDocuments: RagDocumentationFullDocument[] = [];
  for (const [documentationId, meta] of top) {
    const tr = translationMap.get(documentationId);
    if (!tr) {
      continue;
    }

    fullDocuments.push({
      documentationId: tr.documentationId,
      externalId: meta.externalId,
      locale: tr.locale,
      title: tr.title.trim(),
      content: tr.content.trim(),
      bestChunkSimilarity: meta.similarity,
      citationUrl: `/app/admin/documentation/${encodeURIComponent(meta.externalId)}`,
      isPublic: meta.isPublic,
    });
  }

  const citations: DocumentationSupportCitation[] = fullDocuments.map((doc) => ({
    title: doc.title,
    url: doc.citationUrl,
    externalId: doc.externalId,
    isPublic: doc.isPublic,
  }));

  const noResults = fullDocuments.length === 0;

  return {
    fullDocuments,
    citations,
    noResults,
    noResultsGuidance: noResults
      ? [
          'Retrieval found similar chunks but full documentation text could not be loaded.',
          `Respond helpfully and suggest contacting ${getSupportReplyToEmail()} if needed.`,
        ].join(' ')
      : null,
  };
};
