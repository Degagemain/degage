import { syncDocumentationEmbeddings } from '@/actions/documentation/embed';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const POST = withAdmin(async () => {
  try {
    const result = await syncDocumentationEmbeddings();
    return Response.json(result);
  } catch (error) {
    logger.exception(error, { route: 'admin-documentation-embeddings-sync' });
    return Response.json(
      {
        code: 'internal_error',
        errors: [{ message: 'Embedding sync failed unexpectedly. Check server logs for details.' }],
      },
      { status: 500 },
    );
  }
});
