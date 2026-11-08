import { type NextRequest } from 'next/server';
import { searchFeatureFlags } from '@/actions/feature-flag/list';
import { featureFlagFilterSchema } from '@/domain/feature-flag.filter';
import { badRequestResponseFromZod } from '@/api/utils';
import { withPublic } from '@/api/with-context';

export const GET = withPublic(async (request: NextRequest) => {
  const filter = featureFlagFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchFeatureFlags(filter.data);
  return Response.json(result);
});
