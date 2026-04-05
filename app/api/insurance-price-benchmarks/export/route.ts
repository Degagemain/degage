import { type NextRequest } from 'next/server';
import { exportInsurancePriceBenchmarks, exportInsurancePriceBenchmarksCsv } from '@/actions/insurance-price-benchmark/export';
import { insurancePriceBenchmarkFilterSchema } from '@/domain/insurance-price-benchmark.filter';
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

  const rawParams = Object.fromEntries(request.nextUrl.searchParams);
  delete rawParams.exportFormat;
  delete rawParams.format;

  const filter = insurancePriceBenchmarkFilterSchema.safeParse(rawParams);
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  if (exportFormat === 'json') {
    return attachmentDownloadJsonResponse(
      JSON.stringify(await exportInsurancePriceBenchmarks(filter.data)),
      `insurance-price-benchmarks-${stamp}.json`,
    );
  }

  return attachmentDownloadCsvResponse(await exportInsurancePriceBenchmarksCsv(filter.data), `insurance-price-benchmarks-${stamp}.csv`);
});
