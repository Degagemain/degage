import type {
  Documentation,
  DocumentationAudienceRole,
  DocumentationFormat,
  DocumentationSource,
  DocumentationTag,
} from '@/domain/documentation.model';
import { dbDocumentationChunkReadHashesByLocale } from '@/storage/documentation-chunk/documentation-chunk.read';
import { getPrismaClient, sha256Hex } from '@/storage/utils';

export type DocumentationEmbeddingSyncPlan = {
  totalDocumentation: number;
  skippedNoTranslation: number;
  skippedEmptyTitle: number;
  skippedUnchangedHash: number;
  documentationToProcess: Documentation[];
};

const documentationFromLocaleRow = (
  doc: {
    id: string;
    source: string;
    externalId: string;
    isFaq: boolean;
    format: string;
    audienceRoles: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  },
  translation: { locale: string; title: string; content: string },
): Documentation => ({
  id: doc.id,
  source: doc.source as DocumentationSource,
  externalId: doc.externalId,
  isFaq: doc.isFaq,
  format: doc.format as DocumentationFormat,
  audienceRoles: doc.audienceRoles as DocumentationAudienceRole[],
  tags: doc.tags as DocumentationTag[],
  translations: [
    {
      locale: translation.locale,
      title: translation.title,
      content: translation.content,
    },
  ],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const dbDocumentationPlanEmbeddingSyncByLocale = async (locale: string): Promise<DocumentationEmbeddingSyncPlan> => {
  const prisma = getPrismaClient();
  const totalDocumentation = await prisma.documentation.count();
  const existingChunkHashes = await dbDocumentationChunkReadHashesByLocale(locale);
  const rows = await prisma.documentationTranslation.findMany({
    where: { locale },
    include: { documentation: true },
  });

  const skippedNoTranslation = totalDocumentation - rows.length;
  let skippedEmptyTitle = 0;
  let skippedUnchangedHash = 0;
  const documentationToProcess: Documentation[] = [];

  for (const row of rows) {
    const normalizedTitle = row.title.trim();
    const normalizedContent = row.content.trim();
    if (!normalizedTitle) {
      skippedEmptyTitle += 1;
      continue;
    }
    const computed = sha256Hex(`${normalizedTitle}\n${normalizedContent}`);
    const previousHash = existingChunkHashes.get(row.documentationId);
    if (previousHash !== undefined && previousHash === computed) {
      skippedUnchangedHash += 1;
      continue;
    }
    documentationToProcess.push(
      documentationFromLocaleRow(row.documentation, {
        locale: row.locale,
        title: row.title,
        content: row.content,
      }),
    );
  }

  return {
    totalDocumentation,
    skippedNoTranslation,
    skippedEmptyTitle,
    skippedUnchangedHash,
    documentationToProcess,
  };
};

export const dbDocumentationListNeedingEmbeddingSyncByLocale = async (locale: string): Promise<Documentation[]> => {
  const plan = await dbDocumentationPlanEmbeddingSyncByLocale(locale);
  return plan.documentationToProcess;
};
