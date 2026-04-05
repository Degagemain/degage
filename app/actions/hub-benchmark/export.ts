import { getTranslations } from 'next-intl/server';
import { searchHubBenchmarks } from '@/actions/hub-benchmark/search';
import { pageAll } from '@/actions/utils';
import { type HubBenchmarkFilter } from '@/domain/hub-benchmark.filter';
import { type HubBenchmark } from '@/domain/hub-benchmark.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportHubBenchmarks = async (filter: HubBenchmarkFilter): Promise<HubBenchmark[]> => {
  return pageAll(searchHubBenchmarks, filter);
};

const buildHubBenchmarkExportColumns = async (locale: string): Promise<CsvColumn<HubBenchmark>[]> => {
  const t = await getTranslations('admin.hubBenchmarks');

  return [
    { label: t('columns.hub'), format: (row) => formatExportValueByKey('hub', row.hub, locale) },
    { label: t('columns.ownerKm'), format: (row) => formatExportValueByKey('ownerKm', row.ownerKm, locale) },
    { label: t('columns.sharedAvgKm'), format: (row) => formatExportValueByKey('sharedAvgKm', row.sharedAvgKm, locale) },
    { label: t('columns.sharedMinKm'), format: (row) => formatExportValueByKey('sharedMinKm', row.sharedMinKm, locale) },
    { label: t('columns.sharedMaxKm'), format: (row) => formatExportValueByKey('sharedMaxKm', row.sharedMaxKm, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportHubBenchmarksCsv = async (filter: HubBenchmarkFilter): Promise<string> => {
  const records = await exportHubBenchmarks(filter);
  const locale = getRequestLocale();
  const columns = await buildHubBenchmarkExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
