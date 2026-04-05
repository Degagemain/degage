import { getTranslations } from 'next-intl/server';
import { searchInsurancePriceBenchmarks } from '@/actions/insurance-price-benchmark/search';
import { pageAll } from '@/actions/utils';
import { type InsurancePriceBenchmarkFilter } from '@/domain/insurance-price-benchmark.filter';
import { type InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

const formatPriceCap = (value: number): string => {
  if (value >= 999_999_999) return '∞';
  return value.toLocaleString();
};

export const exportInsurancePriceBenchmarks = async (filter: InsurancePriceBenchmarkFilter): Promise<InsurancePriceBenchmark[]> => {
  return pageAll(searchInsurancePriceBenchmarks, filter);
};

const buildInsurancePriceBenchmarkExportColumns = async (locale: string): Promise<CsvColumn<InsurancePriceBenchmark>[]> => {
  const t = await getTranslations('admin.insurancePriceBenchmarks');

  return [
    { label: t('columns.year'), format: (row) => formatExportValueByKey('year', row.year, locale) },
    { label: t('columns.maxCarPrice'), format: (row) => formatPriceCap(row.maxCarPrice) },
    { label: t('columns.baseRate'), format: (row) => formatExportValueByKey('baseRate', row.baseRate, locale) },
    { label: t('columns.rate'), format: (row) => formatExportValueByKey('rate', row.rate, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportInsurancePriceBenchmarksCsv = async (filter: InsurancePriceBenchmarkFilter): Promise<string> => {
  const records = await exportInsurancePriceBenchmarks(filter);
  const locale = getRequestLocale();
  const columns = await buildInsurancePriceBenchmarkExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
