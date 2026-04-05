import { getTranslations } from 'next-intl/server';
import { searchCarTaxBaseRates } from '@/actions/car-tax-base-rate/search';
import { pageAll } from '@/actions/utils';
import { type CarTaxBaseRateFilter } from '@/domain/car-tax-base-rate.filter';
import { type CarTaxBaseRate } from '@/domain/car-tax-base-rate.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarTaxBaseRates = async (filter: CarTaxBaseRateFilter): Promise<CarTaxBaseRate[]> => {
  return pageAll(searchCarTaxBaseRates, filter);
};

const buildCarTaxBaseRateExportColumns = async (locale: string): Promise<CsvColumn<CarTaxBaseRate>[]> => {
  const t = await getTranslations('admin.carTaxBaseRates');

  return [
    { label: t('columns.fiscalRegion'), format: (row) => formatExportValueByKey('fiscalRegion', row.fiscalRegion, locale) },
    { label: t('columns.maxCc'), format: (row) => formatExportValueByKey('maxCc', row.maxCc, locale) },
    { label: t('columns.fiscalPk'), format: (row) => formatExportValueByKey('fiscalPk', row.fiscalPk, locale) },
    { label: t('columns.start'), format: (row) => formatExportValueByKey('start', row.start, locale) },
    { label: t('columns.end'), format: (row) => formatExportValueByKey('end', row.end, locale) },
    { label: t('columns.rate'), format: (row) => formatExportValueByKey('rate', row.rate, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarTaxBaseRatesCsv = async (filter: CarTaxBaseRateFilter): Promise<string> => {
  const records = await exportCarTaxBaseRates(filter);
  const locale = getRequestLocale();
  const columns = await buildCarTaxBaseRateExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
