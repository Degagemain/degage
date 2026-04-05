import { getTranslations } from 'next-intl/server';
import { searchCarPriceEstimates } from '@/actions/car-price-estimate/search';
import { pageAll } from '@/actions/utils';
import { type CarPriceEstimateFilter } from '@/domain/car-price-estimate.filter';
import { type CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarPriceEstimates = async (filter: CarPriceEstimateFilter): Promise<CarPriceEstimate[]> => {
  return pageAll(searchCarPriceEstimates, filter);
};

const buildCarPriceEstimateExportColumns = async (locale: string): Promise<CsvColumn<CarPriceEstimate>[]> => {
  const t = await getTranslations('admin.carPriceEstimates');

  return [
    { label: t('columns.brand'), format: (row) => formatExportValueByKey('brand', row.carType.brand, locale) },
    { label: t('columns.fuelType'), format: (row) => formatExportValueByKey('fuelType', row.carType.fuelType, locale) },
    { label: t('columns.carType'), format: (row) => formatExportValueByKey('carType', row.carType, locale) },
    { label: t('columns.year'), format: (row) => formatExportValueByKey('year', row.year, locale) },
    { label: t('columns.estimateYear'), format: (row) => formatExportValueByKey('estimateYear', row.estimateYear, locale) },
    { label: t('columns.price'), format: (row) => formatExportValueByKey('price', row.price, locale) },
    { label: t('columns.rangeMin'), format: (row) => formatExportValueByKey('rangeMin', row.rangeMin, locale) },
    { label: t('columns.rangeMax'), format: (row) => formatExportValueByKey('rangeMax', row.rangeMax, locale) },
    { label: t('columns.remarks'), format: (row) => formatExportValueByKey('remarks', row.remarks, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarPriceEstimatesCsv = async (filter: CarPriceEstimateFilter): Promise<string> => {
  const records = await exportCarPriceEstimates(filter);
  const locale = getRequestLocale();
  const columns = await buildCarPriceEstimateExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
