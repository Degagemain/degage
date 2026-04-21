import { type NextRequest } from 'next/server';
import { exportEuroNorms, exportEuroNormsCsv } from '@/actions/euro-norm/export';
import { euroNormFilterSchema } from '@/domain/euro-norm.filter';
import { attachmentDownloadCsvResponse, attachmentDownloadJsonResponse, badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const exportFormat = request.nextUrl.searchParams.get('exportFormat') ?? request.nextUrl.searchParams.get('format');
  if (exportFormat !== 'csv' && exportFormat !== 'json') {
    return Response.json({ code: 'invalid query parameters', errors: [{ message: 'format must be csv or json' }] }, { status: 400 });
  }

  const rawParams = Object.fromEntries(request.nextUrl.searchParams);
  delete rawParams.exportFormat;
  delete rawParams.format;

  const filter = euroNormFilterSchema.safeParse(rawParams);
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  if (exportFormat === 'json') {
    return attachmentDownloadJsonResponse(JSON.stringify(await exportEuroNorms(filter.data)), `euro-norms-${stamp}.json`);
  }

  return attachmentDownloadCsvResponse(await exportEuroNormsCsv(filter.data), `euro-norms-${stamp}.csv`);
});
