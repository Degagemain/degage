import { getTranslations } from 'next-intl/server';
import { searchCarBrands } from '@/actions/car-brand/search';
import { pageAll } from '@/actions/utils';
import { type CarBrandFilter } from '@/domain/car-brand.filter';
import { type CarBrand } from '@/domain/car-brand.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarBrands = async (filter: CarBrandFilter): Promise<CarBrand[]> => {
  return pageAll(searchCarBrands, filter);
};

const buildCarBrandExportColumns = async (locale: string): Promise<CsvColumn<CarBrand>[]> => {
  const t = await getTranslations('admin.carBrands');

  return [
    { label: t('columns.code'), format: (row) => formatExportValueByKey('code', row.code, locale) },
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.active'), format: (row) => formatExportValueByKey('isActive', row.isActive, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarBrandsCsv = async (filter: CarBrandFilter): Promise<string> => {
  const records = await exportCarBrands(filter);
  const locale = getRequestLocale();
  const columns = await buildCarBrandExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
