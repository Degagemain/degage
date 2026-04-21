import { type NextRequest } from 'next/server';
import { exportCarInfos, exportCarInfosCsv } from '@/actions/car-info/export';
import { carInfoFilterSchema } from '@/domain/car-info.filter';
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

  const filter = carInfoFilterSchema.safeParse(rawParams);
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  if (exportFormat === 'json') {
    return attachmentDownloadJsonResponse(JSON.stringify(await exportCarInfos(filter.data)), `car-infos-${stamp}.json`);
  }

  return attachmentDownloadCsvResponse(await exportCarInfosCsv(filter.data), `car-infos-${stamp}.csv`);
});
