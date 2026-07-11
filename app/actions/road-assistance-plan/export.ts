import { getTranslations } from 'next-intl/server';
import { searchRoadAssistancePlans } from '@/actions/road-assistance-plan/search';
import { pageAll } from '@/actions/utils';
import { type RoadAssistancePlanFilter } from '@/domain/road-assistance-plan.filter';
import { type RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportRoadAssistancePlans = async (filter: RoadAssistancePlanFilter): Promise<RoadAssistancePlan[]> => {
  return pageAll(searchRoadAssistancePlans, filter);
};

const buildRoadAssistancePlanExportColumns = async (locale: string): Promise<CsvColumn<RoadAssistancePlan>[]> => {
  const t = await getTranslations('admin.roadAssistancePlans');

  return [
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.description'), format: (row) => formatExportValueByKey('description', row.description, locale) },
    { label: t('columns.active'), format: (row) => formatExportValueByKey('isActive', row.isActive, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportRoadAssistancePlansCsv = async (filter: RoadAssistancePlanFilter): Promise<string> => {
  const records = await exportRoadAssistancePlans(filter);
  const locale = getRequestLocale();
  const columns = await buildRoadAssistancePlanExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
