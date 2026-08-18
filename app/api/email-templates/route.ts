import { type NextRequest } from 'next/server';
import { searchEmailTemplates } from '@/actions/email-template/search';
import { createEmailTemplate } from '@/actions/email-template/create';
import { emailTemplateFilterSchema } from '@/domain/email-template.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = emailTemplateFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchEmailTemplates(filter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createEmailTemplate, data);
});
