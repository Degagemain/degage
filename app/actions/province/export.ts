import { getTranslations } from 'next-intl/server';
import { searchProvinces } from '@/actions/province/search';
import { pageAll } from '@/actions/utils';
import { type ProvinceFilter } from '@/domain/province.filter';
import { type Province } from '@/domain/province.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportProvinces = async (filter: ProvinceFilter): Promise<Province[]> => {
  return pageAll(searchProvinces, filter);
};

const buildProvinceExportColumns = async (locale: string): Promise<CsvColumn<Province>[]> => {
  const t = await getTranslations('admin.provinces');

  return [
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.fiscalRegion'), format: (row) => formatExportValueByKey('fiscalRegion', row.fiscalRegion, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportProvincesCsv = async (filter: ProvinceFilter): Promise<string> => {
  const records = await exportProvinces(filter);
  const locale = getRequestLocale();
  const columns = await buildProvinceExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
