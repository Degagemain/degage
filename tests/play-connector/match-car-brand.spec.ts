import { describe, expect, it } from 'vitest';

import { type CatalogCarBrand, type CatalogCarType, buildDegappFleetReport, splitBrandAndModel } from '@/play-connector/match-car-brand';

const opel: CatalogCarBrand = { id: 'opel-id', code: 'opel', name: 'Opel', isActive: true };
const citroen: CatalogCarBrand = { id: 'citroen-id', code: 'citroen', name: 'Citroën', isActive: true };
const alfa: CatalogCarBrand = { id: 'alfa-id', code: 'alfa-romeo', name: 'Alfa Romeo', isActive: true };
const mercedes: CatalogCarBrand = { id: 'mercedes-id', code: 'mercedes-benz', name: 'Mercedes-Benz', isActive: true };
const retired: CatalogCarBrand = { id: 'saab-id', code: 'saab', name: 'Saab', isActive: false };
const mini: CatalogCarBrand = { id: 'mini-id', code: 'mini', name: 'MINI', isActive: true };
const miniClone: CatalogCarBrand = { id: 'mini-clone-id', code: 'mini-clone', name: 'Mini', isActive: true };
const volkswagen: CatalogCarBrand = { id: 'vw-id', code: 'volkswagen', name: 'Volkswagen', isActive: true };

const catalog = [opel, citroen, alfa, mercedes, retired, mini, volkswagen];

const zafira: CatalogCarType = { id: 'zafira-id', brandId: opel.id, fuelCode: 'gasoline', name: 'ZAFIRA', isActive: true };
const berlingo: CatalogCarType = { id: 'berlingo-id', brandId: citroen.id, fuelCode: 'diesel', name: 'BERLINGO', isActive: true };
const berlingoVan: CatalogCarType = {
  id: 'berlingo-van-id',
  brandId: citroen.id,
  fuelCode: 'diesel',
  name: 'BERLINGO Van',
  isActive: true,
};
const golf: CatalogCarType = { id: 'golf-id', brandId: volkswagen.id, fuelCode: 'diesel', name: 'GOLF', isActive: true };
const golfVariant: CatalogCarType = {
  id: 'golf-variant-id',
  brandId: volkswagen.id,
  fuelCode: 'diesel',
  name: 'GOLF Variant',
  isActive: true,
};
const id3: CatalogCarType = { id: 'id3-id', brandId: volkswagen.id, fuelCode: 'electric', name: 'ID.3', isActive: true };
const zafiraAgain: CatalogCarType = { id: 'zafira-2-id', brandId: opel.id, fuelCode: 'gasoline', name: 'ZAFIRA', isActive: true };

const types = [zafira, berlingo, berlingoVan, golf, golfVariant, id3];

const confidentType = (type: CatalogCarType) => ({
  status: 'confident' as const,
  typeId: type.id,
  typeName: type.name,
  isActive: type.isActive,
});

describe('splitBrandAndModel', () => {
  it('takes the longest catalog brand from the start and leaves the model text', () => {
    expect(splitBrandAndModel('Opel Zafira', catalog)).toEqual({ model: 'Zafira', match: { status: 'confident', brand: opel } });
    expect(splitBrandAndModel('Citroën Berlingo', catalog)).toEqual({
      model: 'Berlingo',
      match: { status: 'confident', brand: citroen },
    });
    expect(splitBrandAndModel('Alfa Romeo Giulia', catalog)).toEqual({ model: 'Giulia', match: { status: 'confident', brand: alfa } });
    expect(splitBrandAndModel('Mercedes C220', catalog)).toEqual({ model: 'C220', match: { status: 'confident', brand: mercedes } });
    expect(splitBrandAndModel('Saab', catalog)).toEqual({ model: '', match: { status: 'confident', brand: retired } });
  });

  it('keeps the whole string when no catalog brand is a prefix', () => {
    expect(splitBrandAndModel('zoe Intens', catalog)).toEqual({ model: 'zoe Intens', match: { status: 'missing' } });
    expect(splitBrandAndModel('VW Golf', catalog)).toEqual({ model: 'VW Golf', match: { status: 'missing' } });
  });

  it('reports a conflict when two brands match the same prefix', () => {
    expect(splitBrandAndModel('MINI', [mini, miniClone]).match).toEqual({ status: 'conflict', candidates: [mini, miniClone] });
  });
});

describe('buildDegappFleetReport', () => {
  it('matches a catalog type for the same brand and fuel, and prefers the longer name', () => {
    const fleet = [
      { id: 1, name: 'Chocolat', brandModel: 'Opel Zafira', fuel: 'Benzine' },
      { id: 2, name: 'Passata', brandModel: 'Citroën Berlingo', fuel: 'Diesel' },
      { id: 3, name: 'Variant', brandModel: 'Volkswagen Golf Variant', fuel: 'Diesel' },
      { id: 4, name: 'ShortGolf', brandModel: 'Volkswagen Golf 1.6', fuel: 'Diesel' },
      { id: 5, name: 'Buzz', brandModel: 'Volkswagen ID3', fuel: 'Elektrisch' },
      { id: 6, name: 'Lea', brandModel: 'zoe Intens', fuel: 'Elektrisch' },
      { id: 7, name: 'Unknown', brandModel: 'Opel Doesnotexist', fuel: 'Benzine' },
    ];

    const report = buildDegappFleetReport(fleet, catalog, types, 1);

    expect(report.cars.map((car) => ({ name: car.name, model: car.model, brand: car.brand.status, type: car.type }))).toEqual([
      {
        name: 'Chocolat',
        model: 'Zafira',
        brand: 'confident',
        type: confidentType(zafira),
      },
      {
        name: 'Passata',
        model: 'Berlingo',
        brand: 'confident',
        type: confidentType(berlingo),
      },
      {
        name: 'Variant',
        model: 'Golf Variant',
        brand: 'confident',
        type: confidentType(golfVariant),
      },
      {
        name: 'ShortGolf',
        model: 'Golf 1.6',
        brand: 'confident',
        type: confidentType(golf),
      },
      { name: 'Buzz', model: 'ID3', brand: 'confident', type: confidentType(id3) },
      { name: 'Lea', model: 'zoe Intens', brand: 'missing', type: null },
      { name: 'Unknown', model: 'Doesnotexist', brand: 'confident', type: { status: 'suggested' } },
    ]);
    expect(report.missingBrands).toEqual([{ brandModel: 'zoe Intens', count: 1 }]);
    expect(report.missingTypes).toEqual([{ brandName: 'Opel', brandCode: 'opel', fuel: 'Benzine', model: 'Doesnotexist', count: 1 }]);
    expect(report.skippedBicycles).toBe(1);
  });

  it('keeps one type when the catalog lists the same name twice', () => {
    const report = buildDegappFleetReport(
      [{ id: 1, name: 'Chocolat', brandModel: 'Opel Zafira', fuel: 'Benzine' }],
      catalog,
      [zafira, zafiraAgain],
      0,
    );

    expect(report.cars[0].type).toEqual(confidentType(zafiraAgain));
  });

  it('matches a one-character brand typo, a brand glued to its number, and a model with no brand', () => {
    const toyota: CatalogCarBrand = { id: 'toyota-id', code: 'toyota', name: 'Toyota', isActive: true };
    const peugeot: CatalogCarBrand = { id: 'peugeot-id', code: 'peugeot', name: 'Peugeot', isActive: true };
    const hyundai: CatalogCarBrand = { id: 'hyundai-id', code: 'hyundai', name: 'Hyundai', isActive: true };
    const fiat: CatalogCarBrand = { id: 'fiat-id', code: 'fiat', name: 'Fiat', isActive: true };
    const renault: CatalogCarBrand = { id: 'renault-id', code: 'renault', name: 'Renault', isActive: true };
    const recoveryBrands = [toyota, peugeot, hyundai, fiat, renault];
    const recoveryTypes: CatalogCarType[] = [
      { id: 'aygo-id', brandId: toyota.id, fuelCode: 'gasoline', name: 'AYGO', isActive: true },
      { id: 'rifter-id', brandId: peugeot.id, fuelCode: 'diesel', name: 'RIFTER', isActive: true },
      { id: 'i20-id', brandId: hyundai.id, fuelCode: 'gasoline', name: 'I20', isActive: true },
      { id: 'fiat-500-id', brandId: fiat.id, fuelCode: 'gasoline', name: '500', isActive: true },
      { id: 'zoe-id', brandId: renault.id, fuelCode: 'electric', name: 'ZOE', isActive: true },
    ];

    const report = buildDegappFleetReport(
      [
        { id: 1, name: 'Una', brandModel: 'Toyoya Aygo', fuel: 'Benzine' },
        { id: 2, name: 'Riffie', brandModel: 'Peugot Rifter', fuel: 'Diesel' },
        { id: 3, name: 'RedCharlie', brandModel: 'Huyndai I20', fuel: 'Benzine' },
        { id: 4, name: 'KleinMaarFijn', brandModel: 'FIAT500 FIAT500', fuel: 'Benzine' },
        { id: 5, name: 'Lea', brandModel: 'zoe Intens', fuel: 'Elektrisch' },
      ],
      recoveryBrands,
      recoveryTypes,
      0,
    );

    expect(
      report.cars.map((car) => ({
        name: car.name,
        brand: car.brand.status === 'confident' ? car.brand.brandName : car.brand.status,
        type: car.type,
      })),
    ).toEqual([
      { name: 'Una', brand: 'Toyota', type: confidentType(recoveryTypes[0]) },
      { name: 'Riffie', brand: 'Peugeot', type: confidentType(recoveryTypes[1]) },
      { name: 'RedCharlie', brand: 'Hyundai', type: confidentType(recoveryTypes[2]) },
      { name: 'KleinMaarFijn', brand: 'Fiat', type: confidentType(recoveryTypes[3]) },
      { name: 'Lea', brand: 'Renault', type: confidentType(recoveryTypes[4]) },
    ]);
    expect(report.missingBrands).toEqual([]);
  });
});
