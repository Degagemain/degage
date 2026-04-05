import { getTranslations } from 'next-intl/server';
import { searchCarInfos } from '@/actions/car-info/search';
import { pageAll } from '@/actions/utils';
import { type CarInfoFilter } from '@/domain/car-info.filter';
import { type CarInfo } from '@/domain/car-info.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarInfos = async (filter: CarInfoFilter): Promise<CarInfo[]> => {
  return pageAll(searchCarInfos, filter);
};

const buildCarInfoExportColumns = async (locale: string): Promise<CsvColumn<CarInfo>[]> => {
  const t = await getTranslations('admin.carInfos');

  return [
    { label: t('columns.brand'), format: (row) => formatExportValueByKey('brand', row.carType.brand, locale) },
    { label: t('columns.fuelType'), format: (row) => formatExportValueByKey('fuelType', row.carType.fuelType, locale) },
    { label: t('columns.carType'), format: (row) => formatExportValueByKey('carType', row.carType, locale) },
    { label: t('columns.year'), format: (row) => formatExportValueByKey('year', row.year, locale) },
    { label: t('columns.cylinderCc'), format: (row) => formatExportValueByKey('cylinderCc', row.cylinderCc, locale) },
    { label: t('columns.co2Emission'), format: (row) => formatExportValueByKey('co2Emission', row.co2Emission, locale) },
    { label: t('columns.ecoscore'), format: (row) => formatExportValueByKey('ecoscore', row.ecoscore, locale) },
    { label: t('columns.euroNorm'), format: (row) => formatExportValueByKey('euroNorm', row.euroNorm, locale) },
    { label: t('columns.consumption'), format: (row) => formatExportValueByKey('consumption', row.consumption, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarInfosCsv = async (filter: CarInfoFilter): Promise<string> => {
  const records = await exportCarInfos(filter);
  const locale = getRequestLocale();
  const columns = await buildCarInfoExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
