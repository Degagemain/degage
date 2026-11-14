import * as cheerio from 'cheerio';

export type PlayFleetCar = {
  id: number;
  name: string;
  brandModel: string;
  fuel: string | null;
};

export type PlayFleetParseResult = {
  cars: PlayFleetCar[];
  skippedBicycles: number;
};

const FLEET_FUELS = new Set(['Benzine', 'Diesel', 'Elektrisch', 'Hybride', 'Plugin Hybride', 'LPG', 'CNG']);

const collapseText = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const parseReserveFleet = (html: string): PlayFleetParseResult => {
  const $ = cheerio.load(html);
  const cars: PlayFleetCar[] = [];
  let skippedBicycles = 0;

  $('div#rij').each((_, row) => {
    const hidden = $(row)
      .find('a')
      .filter((__, anchor) => ($(anchor).attr('style') ?? '').includes('display: none'))
      .map((__, anchor) => collapseText($(anchor).text()))
      .get();
    // Hidden anchors: coordinates, empty, view path, thumbnail, brand and model, vehicle kind.
    const kind = hidden[hidden.length - 1] ?? '';
    if (kind === 'BICYCLE') {
      skippedBicycles += 1;
      return;
    }
    if (kind !== 'CAR') return;

    const viewPath = hidden.find((value) => value.startsWith('/cars/view?id=')) ?? '';
    const idMatch = viewPath.match(/id=(\d+)/);
    const name = collapseText($(row).find('a[data-toggle="collapse"]').first().text());
    const brandModel = hidden.find((value) => value && !value.startsWith('/') && !value.startsWith('{') && value !== kind) ?? '';
    if (!idMatch || !name) return;

    const id = Number(idMatch[1]);
    if (!Number.isInteger(id) || id <= 0) return;

    const fuel =
      $(row)
        .find('span.label')
        .map((__, label) => collapseText($(label).text()))
        .get()
        .find((label) => FLEET_FUELS.has(label)) ?? null;

    cars.push({ id, name, brandModel, fuel });
  });

  return { cars, skippedBicycles };
};
