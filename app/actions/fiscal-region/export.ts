import { getTranslations } from 'next-intl/server';
import { searchFiscalRegions } from '@/actions/fiscal-region/search';
import { pageAll } from '@/actions/utils';
import { type FiscalRegionFilter } from '@/domain/fiscal-region.filter';
import { type FiscalRegion } from '@/domain/fiscal-region.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportFiscalRegions = async (filter: FiscalRegionFilter): Promise<FiscalRegion[]> => {
  return pageAll(searchFiscalRegions, filter);
};

const buildFiscalRegionExportColumns = async (locale: string): Promise<CsvColumn<FiscalRegion>[]> => {
  const t = await getTranslations('admin.fiscalRegions');

  return [
    { label: t('columns.code'), format: (row) => formatExportValueByKey('code', row.code, locale) },
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.default'), format: (row) => formatExportValueByKey('isDefault', row.isDefault, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportFiscalRegionsCsv = async (filter: FiscalRegionFilter): Promise<string> => {
  const records = await exportFiscalRegions(filter);
  const locale = getRequestLocale();
  const columns = await buildFiscalRegionExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
