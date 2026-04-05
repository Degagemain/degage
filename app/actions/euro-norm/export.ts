import { getTranslations } from 'next-intl/server';
import { searchEuroNorms } from '@/actions/euro-norm/search';
import { pageAll } from '@/actions/utils';
import { type EuroNormFilter } from '@/domain/euro-norm.filter';
import { type EuroNorm } from '@/domain/euro-norm.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportEuroNorms = async (filter: EuroNormFilter): Promise<EuroNorm[]> => {
  return pageAll(searchEuroNorms, filter);
};

const buildEuroNormExportColumns = async (locale: string): Promise<CsvColumn<EuroNorm>[]> => {
  const t = await getTranslations('admin.euroNorms');

  return [
    { label: t('columns.code'), format: (row) => formatExportValueByKey('code', row.code, locale) },
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.group'), format: (row) => formatExportValueByKey('group', row.group, locale) },
    { label: t('columns.active'), format: (row) => formatExportValueByKey('isActive', row.isActive, locale) },
    { label: t('columns.start'), format: (row) => formatExportValueByKey('start', row.start, locale) },
    { label: t('columns.end'), format: (row) => formatExportValueByKey('end', row.end, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportEuroNormsCsv = async (filter: EuroNormFilter): Promise<string> => {
  const records = await exportEuroNorms(filter);
  const locale = getRequestLocale();
  const columns = await buildEuroNormExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
