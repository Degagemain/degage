import { readEmailDesign } from '@/actions/email-design/read';
import { tryReadResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

type DesignRouteParams = { params: Promise<{ id: string }> };

export const GET = withAdmin(async (_request, context) => {
  const { id } = await (context as DesignRouteParams).params;
  return tryReadResource(readEmailDesign, decodeURIComponent(id));
});
