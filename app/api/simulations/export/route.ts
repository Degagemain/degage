import { type NextRequest } from 'next/server';
import { exportSimulations, exportSimulationsCsv } from '@/actions/simulation/export';
import { parseSimulationExportRequestFromSearchParams } from '@/api/simulations/simulation-query-params';
import { attachmentDownloadCsvResponse, attachmentDownloadJsonResponse } from '@/api/utils';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const { data, errorResponse } = parseSimulationExportRequestFromSearchParams(request.nextUrl.searchParams);
  if (errorResponse) return errorResponse;

  const stamp = new Date().toISOString().slice(0, 10);

  if (data.format === 'json') {
    return attachmentDownloadJsonResponse(JSON.stringify(await exportSimulations(data)), `simulations-${stamp}.json`);
  }

  return attachmentDownloadCsvResponse(await exportSimulationsCsv(data), `simulations-${stamp}.csv`);
});
