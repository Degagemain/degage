import type { DocumentationChunkType, DocumentationChunkUpsertItem } from '@/domain/documentation-chunk.model';
import type { Documentation } from '@/domain/documentation.model';
import { DocumentationSortColumns } from '@/domain/documentation.filter';
import { SortOrder } from '@/domain/utils';
import { type ContentLocale, contentLocales } from '@/i18n/locales';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationRead } from '@/storage/documentation/documentation.read';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';
import {
  dbDocumentationChunkReadHashesByLocale,
  dbDocumentationChunkReadHashesForDocumentation,
} from '@/storage/documentation-chunk/documentation-chunk.read';
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

type EmbedLocaleOutcome = 'updated' | 'skipped' | 'failed';

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
    isPublic: null,
    sources: undefined,
    tags: undefined,
    formats: undefined,
    groupIds: undefined,
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

const embedDocumentationLocaleIfChanged = async (
  docId: string,
  docRef: string,
  locale: ContentLocale,
  translation: { locale: string; title: string; content: string } | undefined,
  previousHash: string | undefined,
): Promise<EmbedLocaleOutcome> => {
  if (!translation) {
    logger.info('[embeddings] skipped, missing locale translation', { locale, docRef });
    return 'skipped';
  }

  const normalizedTitle = translation.title.trim();
  const normalizedContent = translation.content.trim();
  if (!normalizedTitle) {
    logger.info('[embeddings] skipped, empty title', { docRef, locale });
    return 'skipped';
  }

  const contentHash = sha256Hex(`${normalizedTitle}\n${normalizedContent}`);
  if (previousHash && previousHash === contentHash) {
    logger.info('[embeddings] skipped, hash unchanged', { docRef, locale });
    return 'skipped';
  }

  const chunkDrafts = buildChunkDrafts(normalizedTitle, normalizedContent);
  logger.info('[embeddings] processing', {
    docRef,
    locale,
    titleLength: normalizedTitle.length,
    contentLength: normalizedContent.length,
    chunkCount: chunkDrafts.length,
  });

  let chunksWithEmbeddings: DocumentationChunkUpsertItem[] | null = null;

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
    logger.exception(error, {
      docRef,
      locale,
      chunkCount: chunkDrafts.length,
      phase: 'generate-chunk-embeddings',
    });
    return 'failed';
  }

  try {
    await dbDocumentationChunkReplaceForLocale(docId, locale, chunksWithEmbeddings);
    logger.info('[embeddings] upsert succeeded', { docRef, locale, chunkCount: chunksWithEmbeddings.length });
    return 'updated';
  } catch (error) {
    logger.exception(error, {
      docRef,
      locale,
      chunkCount: chunksWithEmbeddings?.length,
      phase: 'upsert-chunks',
    });
    return 'failed';
  }
};

export const embedDocumentationById = async (documentationId: string): Promise<void> => {
  const doc = await dbDocumentationRead(documentationId);
  if (!doc?.id) return;

  const docId = doc.id;
  const docRef = `${doc.externalId} (${docId})`;
  const existingHashes = await dbDocumentationChunkReadHashesForDocumentation(docId);

  for (const locale of contentLocales) {
    const translation = doc.translations.find((item) => item.locale === locale);
    await embedDocumentationLocaleIfChanged(docId, docRef, locale, translation, existingHashes.get(locale));
  }
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
      const existingHashes = existingHashesByLocale.get(locale)!;
      const outcome = await embedDocumentationLocaleIfChanged(docId, docRef, locale, translation, existingHashes.get(docId));

      if (outcome === 'updated') {
        const normalizedTitle = translation?.title.trim() ?? '';
        const normalizedContent = translation?.content.trim() ?? '';
        existingHashes.set(docId, sha256Hex(`${normalizedTitle}\n${normalizedContent}`));
        updatedDocumentation += 1;
      } else if (outcome === 'skipped') {
        skippedDocumentation += 1;
      } else {
        failedDocumentation += 1;
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
