import { type NextRequest } from 'next/server';
import { exportCarTypes, exportCarTypesCsv } from '@/actions/car-type/export';
import { carTypeFilterSchema } from '@/domain/car-type.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { attachmentDownloadCsvResponse, attachmentDownloadJsonResponse, badRequestResponseFromZod } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const exportFormat = request.nextUrl.searchParams.get('exportFormat') ?? request.nextUrl.searchParams.get('format');
  if (exportFormat !== 'csv' && exportFormat !== 'json') {
    return Response.json({ code: 'invalid query parameters', errors: [{ message: 'format must be csv or json' }] }, { status: 400 });
  }

  const sp = request.nextUrl.searchParams;
  const params: Record<string, unknown> = {};
  for (const [key, value] of sp.entries()) {
    if (key === 'brandId' || key === 'fuelTypeId' || key === 'exportFormat' || key === 'format') continue;
    params[key] = value;
  }
  params.brandIds = sp.getAll('brandId');
  params.fuelTypeIds = sp.getAll('fuelTypeId');

  const filter = carTypeFilterSchema.safeParse(params);
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  if (exportFormat === 'json') {
    return attachmentDownloadJsonResponse(JSON.stringify(await exportCarTypes(filter.data)), `car-types-${stamp}.json`);
  }

  return attachmentDownloadCsvResponse(await exportCarTypesCsv(filter.data), `car-types-${stamp}.csv`);
});
