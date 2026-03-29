import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import { getRequestContentLocale } from '@/context/request-context';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationChunkSearch } from '@/storage/documentation-chunk/documentation-chunk.search';

export type RagDocumentationCitation = {
  documentationId: string;
  externalId: string;
  title: string;
  url: string;
};

export type RagDocumentationChunk = {
  chunkId: string;
  documentationId: string;
  externalId: string;
  title: string;
  chunkContent: string;
  similarity: number;
  citationUrl: string;
};

type SearchRagOptions = {
  viewerAudienceRole: DocumentationAudienceRole;
  limit?: number;
};

export const searchDocumentationForRag = async (
  query: string,
  options: SearchRagOptions,
): Promise<{
  chunks: RagDocumentationChunk[];
  citations: RagDocumentationCitation[];
  noResults: boolean;
  noResultsGuidance: string | null;
}> => {
  const locale = getRequestContentLocale();
  const queryEmbedding = await generateEmbedding(query, 'RETRIEVAL_QUERY');

  const rows = await dbDocumentationChunkSearch(queryEmbedding, {
    viewerAudienceRole: options.viewerAudienceRole,
    limit: options.limit ?? 15,
    locale,
  });

  const chunks: RagDocumentationChunk[] = rows.map((row) => ({
    chunkId: row.chunkId,
    documentationId: row.documentationId,
    externalId: row.externalId,
    title: row.title,
    chunkContent: row.content,
    similarity: row.similarity,
    citationUrl: `/app/docs/${encodeURIComponent(row.externalId)}`,
  }));

  const citationMap = new Map<string, RagDocumentationCitation>();
  for (const chunk of chunks) {
    if (!citationMap.has(chunk.documentationId)) {
      citationMap.set(chunk.documentationId, {
        documentationId: chunk.documentationId,
        externalId: chunk.externalId,
        title: chunk.title,
        url: chunk.citationUrl,
      });
    }
  }

  return {
    chunks,
    citations: Array.from(citationMap.values()),
    noResults: chunks.length === 0,
    noResultsGuidance:
      chunks.length === 0
        ? 'No relevant documentation chunks were found. Respond helpfully: say you could not find matching docs, ask one clarifying question, and suggest rephrasing.'
        : null,
  };
};
