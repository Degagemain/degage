import { getTranslations } from 'next-intl/server';
import { searchTowns } from '@/actions/town/search';
import { pageAll } from '@/actions/utils';
import { type TownFilter } from '@/domain/town.filter';
import { type Town } from '@/domain/town.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportTowns = async (filter: TownFilter): Promise<Town[]> => {
  return pageAll(searchTowns, filter);
};

const buildTownExportColumns = async (locale: string): Promise<CsvColumn<Town>[]> => {
  const t = await getTranslations('admin.towns');

  return [
    { label: t('columns.zip'), format: (row) => formatExportValueByKey('zip', row.zip, locale) },
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.municipality'), format: (row) => formatExportValueByKey('municipality', row.municipality, locale) },
    { label: t('columns.province'), format: (row) => formatExportValueByKey('province', row.province, locale) },
    { label: t('columns.hub'), format: (row) => formatExportValueByKey('hub', row.hub, locale) },
    { label: t('columns.highDemand'), format: (row) => formatExportValueByKey('highDemand', row.highDemand, locale) },
    { label: t('columns.hasActiveMembers'), format: (row) => formatExportValueByKey('hasActiveMembers', row.hasActiveMembers, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportTownsCsv = async (filter: TownFilter): Promise<string> => {
  const records = await exportTowns(filter);
  const locale = getRequestLocale();
  const columns = await buildTownExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
