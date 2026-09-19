import { syncDocumentationEmbeddings } from '@/actions/documentation/embed';
import { getPrismaClient } from '@/storage/utils';

async function main(): Promise<void> {
  const result = await syncDocumentationEmbeddings();
  console.log(
    `Documentation embedding sync: total ${result.totalDocumentation}, updated ${result.updatedDocumentation}, skipped ${result.skippedDocumentation}, failed ${result.failedDocumentation}.`,
  );
  if (result.failedDocumentation > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Documentation embedding sync failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await getPrismaClient().$disconnect();
    } catch {
      // No client if DATABASE_URL was never set.
    }
  });
