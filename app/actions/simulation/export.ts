import { getTranslations } from 'next-intl/server';
import { searchSimulations } from '@/actions/simulation/search';
import { pageAll } from '@/actions/utils';
import { type SimulationFilter } from '@/domain/simulation.filter';
import { type Simulation } from '@/domain/simulation.model';
import { type CsvColumn, DashPlaceholder, asTextOrDash, buildCsvLinesFromColumns, encodeCsvDocument, formatDateOrDash } from '@/domain/utils';
import { getRequestLocale } from '@/context/request-context';

export const exportSimulations = async (filter: SimulationFilter): Promise<Simulation[]> => {
  return pageAll(searchSimulations, filter);
};

const buildSimulationExportColumns = async (locale: string): Promise<CsvColumn<Simulation>[]> => {
  const tAdmin = await getTranslations('admin.simulations');
  const tResult = await getTranslations('simulation.resultCode');

  return [
    { label: tAdmin('columns.town'), format: (row) => asTextOrDash(row.town?.name) },
    { label: tAdmin('columns.resultCode'), format: (row) => tResult(row.resultCode) },
    { label: tAdmin('columns.brand'), format: (row) => asTextOrDash(row.brand?.name) },
    { label: tAdmin('columns.fuelType'), format: (row) => asTextOrDash(row.fuelType?.name) },
    {
      label: tAdmin('columns.carType'),
      format: (row) => (row.carType?.name ? row.carType.name : row.carTypeOther ? `Other: ${row.carTypeOther}` : DashPlaceholder),
    },
    { label: tAdmin('columns.mileage'), format: (row) => row.mileage.toLocaleString(locale) },
    { label: tAdmin('columns.seats'), format: (row) => String(row.seats) },
    { label: tAdmin('columns.firstRegisteredAt'), format: (row) => formatDateOrDash(row.firstRegisteredAt, locale, false) },
    { label: tAdmin('columns.carTypeOther'), format: (row) => asTextOrDash(row.carTypeOther) },
    { label: tAdmin('columns.created'), format: (row) => formatDateOrDash(row.createdAt, locale, true) },
  ];
};

export const exportSimulationsCsv = async (filter: SimulationFilter): Promise<string> => {
  const records = await exportSimulations(filter);
  const locale = getRequestLocale();
  const columns = await buildSimulationExportColumns(locale);
  return encodeCsvDocument(buildCsvLinesFromColumns(records, columns));
};
