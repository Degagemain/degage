import { getTranslations } from 'next-intl/server';
import { pageAll } from '@/actions/utils';
import { type DocumentationSearchViewerContext } from '@/domain/documentation-audience.utils';
import { type DocumentationFilter } from '@/domain/documentation.filter';
import { type Documentation, type DocumentationAudienceRole } from '@/domain/documentation.model';
import { type CsvColumn, DashPlaceholder, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { type UILocale, defaultContentLocale, defaultUILocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { searchDocumentation } from './search';

const COLUMN_KEYS = ['externalId', 'title', 'source', 'isFaq', 'isPublic', 'tags', 'groups', 'audienceRoles', 'format', 'updatedAt'] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const toLabelKey = (key: ColumnKey): string => {
  if (key === 'updatedAt') return 'columns.updated';
  if (key === 'audienceRoles') return 'columns.roles';
  if (key === 'groups') return 'columns.groups';
  if (key === 'isFaq') return 'columns.isFaq';
  if (key === 'isPublic') return 'columns.isPublic';
  return `columns.${key}`;
};

const getTitleForLocale = (doc: Documentation, uiLocale: string): string => {
  const locale = uiLocales.includes(uiLocale as UILocale) ? (uiLocale as UILocale) : defaultUILocale;
  const contentLocale = getContentLocale(locale);
  return (
    doc.translations.find((translation) => translation.locale === contentLocale)?.title ??
    doc.translations.find((translation) => translation.locale === defaultContentLocale)?.title ??
    doc.translations[0]?.title ??
    doc.externalId
  );
};

export const exportDocumentation = async (filter: DocumentationFilter, viewer: DocumentationSearchViewerContext): Promise<Documentation[]> => {
  return pageAll((paginationFilter) => searchDocumentation(paginationFilter, viewer), filter);
};

const buildDocumentationColumns = async (uiLocale: string): Promise<CsvColumn<Documentation>[]> => {
  const t = await getTranslations('admin.documentation');
  return COLUMN_KEYS.map((key) => ({
    label: t(toLabelKey(key)),
    format: (row) => {
      if (key === 'title') return getTitleForLocale(row, uiLocale);
      if (key === 'audienceRoles') {
        if (row.audienceRoles.length === 0) return DashPlaceholder;
        return row.audienceRoles.map((role: DocumentationAudienceRole) => t(`columns.audienceRole.${role}`)).join(', ');
      }
      if (key === 'groups') {
        if (row.groups.length === 0) return DashPlaceholder;
        return row.groups.map((g) => g.name ?? g.id).join(', ');
      }
      return formatExportValueByKey(key, (row as Record<string, unknown>)[key], uiLocale);
    },
  }));
};

export const exportDocumentationCsv = async (
  filter: DocumentationFilter,
  viewer: DocumentationSearchViewerContext,
  uiLocale: string,
): Promise<string> => {
  const records = await exportDocumentation(filter, viewer);
  const columns = await buildDocumentationColumns(uiLocale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
