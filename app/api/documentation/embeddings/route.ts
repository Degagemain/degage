import { syncDocumentationEmbeddings } from '@/actions/documentation/embed';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { withContext } from '@/api/with-context';

export const POST = withContext(async () => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  try {
    const result = await syncDocumentationEmbeddings();
    return Response.json(result);
  } catch (error) {
    console.error('[embeddings] admin sync crashed', { error });
    return Response.json(
      {
        code: 'internal_error',
        errors: [{ message: 'Embedding sync failed unexpectedly. Check server logs for details.' }],
      },
      { status: 500 },
    );
  }
});
