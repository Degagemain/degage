import { type NextRequest } from 'next/server';
import { exportDocumentation, exportDocumentationCsv } from '@/actions/documentation/export';
import { documentationFilterFromSearchParams, documentationFilterSchema } from '@/domain/documentation.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { attachmentDownloadCsvResponse, attachmentDownloadJsonResponse, badRequestResponseFromZod } from '@/api/utils';
import { withContext } from '@/api/with-context';
import { getRequestLocale } from '@/context/request-context';

export const GET = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const exportFormat = request.nextUrl.searchParams.get('exportFormat') ?? request.nextUrl.searchParams.get('format');
  if (exportFormat !== 'csv' && exportFormat !== 'json') {
    return Response.json({ code: 'invalid query parameters', errors: [{ message: 'format must be csv or json' }] }, { status: 400 });
  }

  const rawParams = documentationFilterFromSearchParams(request.nextUrl.searchParams);
  delete rawParams.exportFormat;
  delete rawParams.format;

  const filter = documentationFilterSchema.safeParse(rawParams);
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const viewer = { isViewerAdmin: true, isAuthenticated: true } as const;
  const stamp = new Date().toISOString().slice(0, 10);
  if (exportFormat === 'json') {
    return attachmentDownloadJsonResponse(JSON.stringify(await exportDocumentation(filter.data, viewer)), `documentation-${stamp}.json`);
  }

  return attachmentDownloadCsvResponse(await exportDocumentationCsv(filter.data, viewer, getRequestLocale()), `documentation-${stamp}.csv`);
});
