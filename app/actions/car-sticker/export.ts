import { getTranslations } from 'next-intl/server';
import { searchCarStickers } from '@/actions/car-sticker/search';
import { pageAll } from '@/actions/utils';
import { type CarStickerFilter } from '@/domain/car-sticker.filter';
import { type CarSticker } from '@/domain/car-sticker.model';
import { type CsvColumn, buildCsvLinesFromColumns, encodeCsvDocument, formatExportValueByKey } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportCarStickers = async (filter: CarStickerFilter): Promise<CarSticker[]> => {
  return pageAll(searchCarStickers, filter);
};

const buildCarStickerExportColumns = async (locale: string): Promise<CsvColumn<CarSticker>[]> => {
  const t = await getTranslations('admin.carStickers');

  return [
    { label: t('columns.name'), format: (row) => formatExportValueByKey('name', row.name, locale) },
    { label: t('columns.isActive'), format: (row) => formatExportValueByKey('isActive', row.isActive, locale) },
    { label: t('columns.isAlwaysIncluded'), format: (row) => formatExportValueByKey('isAlwaysIncluded', row.isAlwaysIncluded, locale) },
    { label: t('columns.created'), format: (row) => formatExportValueByKey('createdAt', row.createdAt, locale) },
    { label: t('columns.updated'), format: (row) => formatExportValueByKey('updatedAt', row.updatedAt, locale) },
  ];
};

export const exportCarStickersCsv = async (filter: CarStickerFilter): Promise<string> => {
  const records = await exportCarStickers(filter);
  const locale = getRequestLocale();
  const columns = await buildCarStickerExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
