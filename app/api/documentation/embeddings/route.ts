import { headers } from 'next/headers';
import { auth } from '@/auth';
import { syncDocumentationEmbeddings } from '@/actions/documentation/embed';
import { forbiddenResponse, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';
import { isAdmin } from '@/domain/role.utils';

export const POST = withContext(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return unauthorizedResponse();
  }
  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  try {
    const result = await syncDocumentationEmbeddings();
    return Response.json(result);
  } catch (error) {
    console.error('[embeddings] admin sync crashed', { userId: session.user.id, error });
    return Response.json(
      {
        code: 'internal_error',
        errors: [{ message: 'Embedding sync failed unexpectedly. Check server logs for details.' }],
      },
      { status: 500 },
    );
  }
});
