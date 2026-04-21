import type { DocumentationChunkType } from '@/domain/documentation-chunk.model';
import type { Documentation } from '@/domain/documentation.model';
import { DocumentationSortColumns } from '@/domain/documentation.filter';
import { SortOrder } from '@/domain/utils';
import { type ContentLocale, contentLocales } from '@/i18n/locales';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';
import { dbDocumentationChunkReadHashesByLocale } from '@/storage/documentation-chunk/documentation-chunk.read';
import { dbDocumentationChunkReplaceForLocale } from '@/storage/documentation-chunk/documentation-chunk.upsert';
import { sha256Hex } from '@/storage/utils';
import { logger } from '@/lib/logger';

const CONTENT_CHUNK_SIZE = 2000;
const CONTENT_CHUNK_OVERLAP = 300;

export type DocumentationEmbeddingSyncResult = {
  totalDocumentation: number;
  updatedDocumentation: number;
  skippedDocumentation: number;
  failedDocumentation: number;
};

type ChunkDraft = {
  chunkType: DocumentationChunkType;
  content: string;
};

const splitContent = (content: string): string[] => {
  const text = content.trim();
  if (!text) {
    return [];
  }

  const chunks: string[] = [];
  let offset = 0;
  while (offset < text.length) {
    const end = Math.min(offset + CONTENT_CHUNK_SIZE, text.length);
    chunks.push(text.slice(offset, end));
    if (end >= text.length) break;
    offset = Math.max(0, end - CONTENT_CHUNK_OVERLAP);
  }
  return chunks;
};

const buildChunkDrafts = (title: string, content: string): ChunkDraft[] => {
  const drafts: ChunkDraft[] = [];
  drafts.push({ chunkType: 'title', content: title.trim() });
  for (const chunk of splitContent(content)) {
    drafts.push({ chunkType: 'content', content: chunk });
  }
  return drafts;
};

const listAllDocumentationForEmbedding = async (): Promise<Documentation[]> => {
  const baseFilter = {
    query: null,
    isFaq: null,
    sources: undefined,
    tags: undefined,
    formats: undefined,
    skip: 0,
    sortBy: DocumentationSortColumns.UPDATED_AT,
    sortOrder: SortOrder.DESC,
  } as const;

  const totalOnlyPage = await dbDocumentationSearch({
    ...baseFilter,
    take: 0,
  });

  if (totalOnlyPage.total === 0) {
    return [];
  }

  const allDocsPage = await dbDocumentationSearch({
    ...baseFilter,
    take: totalOnlyPage.total,
  });

  return allDocsPage.records;
};

export const syncDocumentationEmbeddings = async (): Promise<DocumentationEmbeddingSyncResult> => {
  const docs = await listAllDocumentationForEmbedding();
  const existingHashesByLocale = new Map<ContentLocale, Map<string, string>>();
  for (const locale of contentLocales) {
    existingHashesByLocale.set(locale, await dbDocumentationChunkReadHashesByLocale(locale));
  }

  logger.info('[embeddings] sync started', { locales: [...contentLocales], documentationCount: docs.length });

  let updatedDocumentation = 0;
  let skippedDocumentation = 0;
  let failedDocumentation = 0;

  for (const doc of docs) {
    if (!doc.id) {
      failedDocumentation += 1;
      logger.error('[embeddings] failed, documentation id is missing', { externalId: doc.externalId });
      continue;
    }

    const docId = doc.id;
    const docRef = `${doc.externalId} (${docId})`;

    for (const locale of contentLocales) {
      const translation = doc.translations.find((item) => item.locale === locale);
      if (!translation) {
        logger.info('[embeddings] skipped, missing locale translation', { locale, docRef });
        skippedDocumentation += 1;
        continue;
      }

      const normalizedTitle = translation.title.trim();
      const normalizedContent = translation.content.trim();
      if (!normalizedTitle) {
        logger.info('[embeddings] skipped, empty title', { docRef, locale });
        skippedDocumentation += 1;
        continue;
      }

      const contentHash = sha256Hex(`${normalizedTitle}\n${normalizedContent}`);
      const existingHashes = existingHashesByLocale.get(locale)!;
      const previousHash = existingHashes.get(docId);
      if (previousHash && previousHash === contentHash) {
        logger.info('[embeddings] skipped, hash unchanged', { docRef, locale });
        skippedDocumentation += 1;
        continue;
      }

      const chunkDrafts = buildChunkDrafts(normalizedTitle, normalizedContent);
      logger.info('[embeddings] processing', {
        docRef,
        locale,
        titleLength: normalizedTitle.length,
        contentLength: normalizedContent.length,
        chunkCount: chunkDrafts.length,
      });

      let chunksWithEmbeddings: Array<{
        documentationId: string;
        locale: string;
        chunkIndex: number;
        chunkType: DocumentationChunkType;
        content: string;
        contentHash: string;
        embedding: number[];
      }> | null = null;

      try {
        chunksWithEmbeddings = await Promise.all(
          chunkDrafts.map(async (chunk, index) => ({
            documentationId: docId,
            locale,
            chunkIndex: index,
            chunkType: chunk.chunkType,
            content: chunk.content,
            contentHash,
            embedding: await generateEmbedding(chunk.content, 'RETRIEVAL_DOCUMENT'),
          })),
        );
      } catch (error) {
        failedDocumentation += 1;
        logger.exception(error, {
          docRef,
          locale,
          chunkCount: chunkDrafts.length,
          phase: 'generate-chunk-embeddings',
        });
        continue;
      }

      try {
        await dbDocumentationChunkReplaceForLocale(docId, locale, chunksWithEmbeddings);
        updatedDocumentation += 1;
        existingHashes.set(docId, contentHash);
        logger.info('[embeddings] upsert succeeded', { docRef, locale, chunkCount: chunksWithEmbeddings.length });
      } catch (error) {
        failedDocumentation += 1;
        logger.exception(error, {
          docRef,
          locale,
          chunkCount: chunksWithEmbeddings?.length,
          phase: 'upsert-chunks',
        });
      }
    }
  }

  logger.info('[embeddings] sync finished', {
    totalDocumentation: docs.length,
    updatedDocumentation,
    skippedDocumentation,
    failedDocumentation,
  });

  return {
    totalDocumentation: docs.length,
    updatedDocumentation,
    skippedDocumentation,
    failedDocumentation,
  };
};
