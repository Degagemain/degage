import { getPrismaClient } from '@/storage/utils';

let ensured = false;

export const dbDocumentationChunkEnsureVectorSupport = async (): Promise<void> => {
  if (ensured) return;

  const prisma = getPrismaClient();
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "DocumentationChunk_embedding_hnsw_idx"
    ON "DocumentationChunk"
    USING hnsw (embedding vector_cosine_ops);
  `);

  ensured = true;
};
