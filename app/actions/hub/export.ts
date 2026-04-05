import { getTranslations } from 'next-intl/server';
import { searchHubs } from '@/actions/hub/search';
import { pageAll } from '@/actions/utils';
import { type HubFilter } from '@/domain/hub.filter';
import { type Hub } from '@/domain/hub.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportHubs = async (filter: HubFilter): Promise<Hub[]> => {
  return pageAll(searchHubs, filter);
};

const buildHubExportColumns = async (locale: string): Promise<CsvColumn<Hub>[]> => {
  const t = await getTranslations('admin.hubs');

  return [
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.default'), format: (row) => formatExportValueByKey('isDefault', row.isDefault, locale) },
    { label: t('columns.simMaxAge'), format: (row) => formatExportValueByKey('simMaxAge', row.simMaxAge, locale) },
    { label: t('columns.simMaxKm'), format: (row) => formatExportValueByKey('simMaxKm', row.simMaxKm, locale) },
    {
      label: t('columns.simMinEuroNormGroupDiesel'),
      format: (row) => formatExportValueByKey('simMinEuroNormGroupDiesel', row.simMinEuroNormGroupDiesel, locale),
    },
    {
      label: t('columns.simMinEcoScoreForBonus'),
      format: (row) => formatExportValueByKey('simMinEcoScoreForBonus', row.simMinEcoScoreForBonus, locale),
    },
    { label: t('columns.simMaxKmForBonus'), format: (row) => formatExportValueByKey('simMaxKmForBonus', row.simMaxKmForBonus, locale) },
    { label: t('columns.simMaxAgeForBonus'), format: (row) => formatExportValueByKey('simMaxAgeForBonus', row.simMaxAgeForBonus, locale) },
    { label: t('columns.simDepreciationKm'), format: (row) => formatExportValueByKey('simDepreciationKm', row.simDepreciationKm, locale) },
    {
      label: t('columns.simDepreciationKmElectric'),
      format: (row) => formatExportValueByKey('simDepreciationKmElectric', row.simDepreciationKmElectric, locale),
    },
    {
      label: t('columns.simInspectionCostPerYear'),
      format: (row) => formatExportValueByKey('simInspectionCostPerYear', row.simInspectionCostPerYear, locale),
    },
    {
      label: t('columns.simMaintenanceCostPerYear'),
      format: (row) => formatExportValueByKey('simMaintenanceCostPerYear', row.simMaintenanceCostPerYear, locale),
    },
    { label: t('columns.simMaxPrice'), format: (row) => formatExportValueByKey('simMaxPrice', row.simMaxPrice, locale) },
    {
      label: t('columns.simAcceptedPriceCategoryA'),
      format: (row) => formatExportValueByKey('simAcceptedPriceCategoryA', row.simAcceptedPriceCategoryA, locale),
    },
    {
      label: t('columns.simAcceptedPriceCategoryB'),
      format: (row) => formatExportValueByKey('simAcceptedPriceCategoryB', row.simAcceptedPriceCategoryB, locale),
    },
    {
      label: t('columns.simAcceptedDepreciationCostKm'),
      format: (row) => formatExportValueByKey('simAcceptedDepreciationCostKm', row.simAcceptedDepreciationCostKm, locale),
    },
    {
      label: t('columns.simAcceptedElectricDepreciationCostKm'),
      format: (row) => formatExportValueByKey('simAcceptedElectricDepreciationCostKm', row.simAcceptedElectricDepreciationCostKm, locale),
    },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportHubsCsv = async (filter: HubFilter): Promise<string> => {
  const records = await exportHubs(filter);
  const locale = getRequestLocale();
  const columns = await buildHubExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
