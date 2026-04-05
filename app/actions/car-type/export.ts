import { getTranslations } from 'next-intl/server';
import { searchCarTypes } from '@/actions/car-type/search';
import { pageAll } from '@/actions/utils';
import { type CarTypeFilter } from '@/domain/car-type.filter';
import { type CarType } from '@/domain/car-type.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarTypes = async (filter: CarTypeFilter): Promise<CarType[]> => {
  return pageAll(searchCarTypes, filter);
};

const buildCarTypeExportColumns = async (locale: string): Promise<CsvColumn<CarType>[]> => {
  const t = await getTranslations('admin.carTypes');

  return [
    { label: t('columns.brand'), format: (row) => formatExportValueByKey('brand', row.brand, locale) },
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.fuelType'), format: (row) => formatExportValueByKey('fuelType', row.fuelType, locale) },
    { label: t('columns.ecoscore'), format: (row) => formatExportValueByKey('ecoscore', row.ecoscore, locale) },
    { label: t('columns.active'), format: (row) => formatExportValueByKey('isActive', row.isActive, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarTypesCsv = async (filter: CarTypeFilter): Promise<string> => {
  const records = await exportCarTypes(filter);
  const locale = getRequestLocale();
  const columns = await buildCarTypeExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
