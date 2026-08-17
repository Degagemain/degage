import { getTranslations } from 'next-intl/server';
import { searchInsurers } from '@/actions/insurer/search';
import { pageAll } from '@/actions/utils';
import { type InsurerFilter } from '@/domain/insurer.filter';
import { type Insurer } from '@/domain/insurer.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportInsurers = async (filter: InsurerFilter): Promise<Insurer[]> => {
  return pageAll(searchInsurers, filter);
};

const buildInsurerExportColumns = async (locale: string): Promise<CsvColumn<Insurer>[]> => {
  const t = await getTranslations('admin.insurers');

  return [
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    {
      label: t('columns.supportsInstantOnboarding'),
      format: (row) => formatExportValueByKey('supportsInstantOnboarding', row.supportsInstantOnboarding, locale),
    },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportInsurersCsv = async (filter: InsurerFilter): Promise<string> => {
  const records = await exportInsurers(filter);
  const locale = getRequestLocale();
  const columns = await buildInsurerExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
