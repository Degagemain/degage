import { getTranslations } from 'next-intl/server';
import { searchCarTaxEuroNormAdjustments } from '@/actions/car-tax-euro-norm-adjustment/search';
import { pageAll } from '@/actions/utils';
import { type CarTaxEuroNormAdjustmentFilter } from '@/domain/car-tax-euro-norm-adjustment.filter';
import { type CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarTaxEuroNormAdjustments = async (filter: CarTaxEuroNormAdjustmentFilter): Promise<CarTaxEuroNormAdjustment[]> => {
  return pageAll(searchCarTaxEuroNormAdjustments, filter);
};

const buildCarTaxEuroNormAdjustmentExportColumns = async (locale: string): Promise<CsvColumn<CarTaxEuroNormAdjustment>[]> => {
  const t = await getTranslations('admin.carTaxEuroNormAdjustments');

  return [
    { label: t('columns.fiscalRegion'), format: (row) => formatExportValueByKey('fiscalRegion', row.fiscalRegion, locale) },
    { label: t('columns.euroNormGroup'), format: (row) => formatExportValueByKey('euroNormGroup', row.euroNormGroup, locale) },
    {
      label: t('columns.defaultAdjustment'),
      format: (row) => formatExportValueByKey('defaultAdjustment', row.defaultAdjustment, locale),
    },
    { label: t('columns.dieselAdjustment'), format: (row) => formatExportValueByKey('dieselAdjustment', row.dieselAdjustment, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarTaxEuroNormAdjustmentsCsv = async (filter: CarTaxEuroNormAdjustmentFilter): Promise<string> => {
  const records = await exportCarTaxEuroNormAdjustments(filter);
  const locale = getRequestLocale();
  const columns = await buildCarTaxEuroNormAdjustmentExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
