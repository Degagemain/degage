import { getTranslations } from 'next-intl/server';
import { searchCarTaxFlatRates } from '@/actions/car-tax-flat-rate/search';
import { pageAll } from '@/actions/utils';
import { type CarTaxFlatRateFilter } from '@/domain/car-tax-flat-rate.filter';
import { type CarTaxFlatRate } from '@/domain/car-tax-flat-rate.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarTaxFlatRates = async (filter: CarTaxFlatRateFilter): Promise<CarTaxFlatRate[]> => {
  return pageAll(searchCarTaxFlatRates, filter);
};

const buildCarTaxFlatRateExportColumns = async (locale: string): Promise<CsvColumn<CarTaxFlatRate>[]> => {
  const t = await getTranslations('admin.carTaxFlatRates');

  return [
    { label: t('columns.fiscalRegion'), format: (row) => formatExportValueByKey('fiscalRegion', row.fiscalRegion, locale) },
    { label: t('columns.start'), format: (row) => formatExportValueByKey('start', row.start, locale) },
    { label: t('columns.rate'), format: (row) => formatExportValueByKey('rate', row.rate, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarTaxFlatRatesCsv = async (filter: CarTaxFlatRateFilter): Promise<string> => {
  const records = await exportCarTaxFlatRates(filter);
  const locale = getRequestLocale();
  const columns = await buildCarTaxFlatRateExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
