import { getPrismaClient } from '@/storage/utils';

let ensured = false;

export const dbDocumentationChunkEnsureVectorSupport = async (): Promise<void> => {
  if (ensured) return;

  const prisma = getPrismaClient();
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');

  ensured = true;
};
