import { getTranslations } from 'next-intl/server';
import { searchFuelTypes } from '@/actions/fuel-type/search';
import { pageAll } from '@/actions/utils';
import { type FuelTypeFilter } from '@/domain/fuel-type.filter';
import { type FuelType } from '@/domain/fuel-type.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportFuelTypes = async (filter: FuelTypeFilter): Promise<FuelType[]> => {
  return pageAll(searchFuelTypes, filter);
};

const buildFuelTypeExportColumns = async (locale: string): Promise<CsvColumn<FuelType>[]> => {
  const t = await getTranslations('admin.fuelTypes');

  return [
    { label: t('columns.code'), format: (row) => formatExportValueByKey('code', row.code, locale) },
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.active'), format: (row) => formatExportValueByKey('isActive', row.isActive, locale) },
    { label: t('columns.pricePer'), format: (row) => formatExportValueByKey('pricePer', row.pricePer, locale) },
    { label: t('columns.co2Contribution'), format: (row) => formatExportValueByKey('co2Contribution', row.co2Contribution, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportFuelTypesCsv = async (filter: FuelTypeFilter): Promise<string> => {
  const records = await exportFuelTypes(filter);
  const locale = getRequestLocale();
  const columns = await buildFuelTypeExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
