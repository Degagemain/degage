import { type NextRequest } from 'next/server';
import { exportSimulations, exportSimulationsCsv } from '@/actions/simulation/export';
import { simulationFilterSchema } from '@/domain/simulation.filter';
import { attachmentDownloadCsvResponse, attachmentDownloadJsonResponse, badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

const simulationFilterInputFromSearchParams = (sp: URLSearchParams): Record<string, unknown> => {
  return {
    query: sp.get('query') ?? undefined,
    brandIds: sp.getAll('brandId'),
    fuelTypeIds: sp.getAll('fuelTypeId'),
    carTypeIds: sp.getAll('carTypeId'),
    resultCodes: sp.getAll('resultCode'),
    sortBy: sp.get('sortBy') ?? undefined,
    sortOrder: sp.get('sortOrder') ?? undefined,
  };
};

export const GET = withAdmin(async (request: NextRequest) => {
  const exportFormat = request.nextUrl.searchParams.get('exportFormat') ?? request.nextUrl.searchParams.get('format');
  if (exportFormat !== 'csv' && exportFormat !== 'json') {
    return Response.json({ code: 'invalid query parameters', errors: [{ message: 'format must be csv or json' }] }, { status: 400 });
  }

  const filter = simulationFilterSchema.safeParse(simulationFilterInputFromSearchParams(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const stamp = new Date().toISOString().slice(0, 10);

  if (exportFormat === 'json') {
    return attachmentDownloadJsonResponse(JSON.stringify(await exportSimulations(filter.data)), `simulations-${stamp}.json`);
  }

  return attachmentDownloadCsvResponse(await exportSimulationsCsv(filter.data), `simulations-${stamp}.csv`);
});
