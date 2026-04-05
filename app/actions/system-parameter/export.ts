import { getTranslations } from 'next-intl/server';
import { searchSystemParameters } from '@/actions/system-parameter/list';
import { pageAll } from '@/actions/utils';
import { type SystemParameterFilter } from '@/domain/system-parameter.filter';
import { type SystemParameter, SystemParameterType } from '@/domain/system-parameter.model';
import { type CsvColumn, DashPlaceholder, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

const formatParameterValue = (parameter: SystemParameter): string => {
  switch (parameter.type) {
    case SystemParameterType.NUMBER:
      return parameter.valueNumber != null ? String(parameter.valueNumber) : DashPlaceholder;
    case SystemParameterType.NUMBER_RANGE:
      if (parameter.valueNumberMin != null && parameter.valueNumberMax != null) {
        return `${parameter.valueNumberMin} - ${parameter.valueNumberMax}`;
      }
      return DashPlaceholder;
    case SystemParameterType.EURONORM:
      return parameter.valueEuronormId ?? DashPlaceholder;
    default:
      return DashPlaceholder;
  }
};

export const exportSystemParameters = async (filter: SystemParameterFilter): Promise<SystemParameter[]> => {
  return pageAll(searchSystemParameters, filter);
};

const buildSystemParameterExportColumns = async (locale: string): Promise<CsvColumn<SystemParameter>[]> => {
  const t = await getTranslations('admin.systemParameters');

  return [
    { label: t('columns.code'), format: (row) => formatExportValueByKey('code', row.code, locale) },
    { label: t('columns.category'), format: (row) => t(`categories.${row.category}`) },
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.type'), format: (row) => t(`types.${row.type}`) },
    { label: t('columns.value'), format: (row) => formatParameterValue(row) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportSystemParametersCsv = async (filter: SystemParameterFilter): Promise<string> => {
  const records = await exportSystemParameters(filter);
  const locale = getRequestLocale();
  const columns = await buildSystemParameterExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
