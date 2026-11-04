import { describe, expect, it } from 'vitest';

import { mapCarOnboardingToGsheetRow } from '@/actions/car-onboarding/gsheet/map-row';
import { CarOnboardingGsheetMappingError } from '@/actions/car-onboarding/gsheet/mapping.error';
import { SimulationResultCode } from '@/domain/simulation.model';
import type { Hub } from '@/domain/hub.model';
import type { Town } from '@/domain/town.model';
import { completeCarOnboarding } from '../../../builders/car-onboarding.builder';
import { simulation } from '../../../builders/simulation.builder';

const hub = (data: Partial<Hub> = {}): Hub => ({
  id: '550e8400-e29b-41d4-a716-446655440010',
  name: 'Test Hub',
  isDefault: false,
  simMaxAge: 15,
  simMaxKm: 200_000,
  simMinEuroNormGroupDiesel: 5,
  simMinEcoScoreForBonus: 65,
  simMaxKmForBonus: 140_000,
  simMaxAgeForBonus: 7,
  simDepreciationKm: 238_000,
  simDepreciationKmElectric: 320_000,
  simInspectionCostPerYear: 43,
  simMaintenanceCostPerYear: 950,
  minSharedKm: 3_000,
  avgSharedKm: 5_000,
  maxSharedKm: 7_000,
  simMaxPrice: null,
  simAcceptedPriceCategoryA: 0.38,
  simAcceptedPriceCategoryB: 0.46,
  simAcceptedDepreciationCostKm: 0.32,
  simAcceptedElectricDepreciationCostKm: 0.33,
  simMinDepreciationCostKm: 0.05,
  createdAt: null,
  updatedAt: null,
  ...data,
});

const town = (data: Partial<Town> = {}): Town => ({
  id: '550e8400-e29b-41d4-a716-446655440099',
  zip: '9031',
  name: 'Drongen',
  municipality: 'Gent',
  province: { id: '550e8400-e29b-41d4-a716-446655440020', name: 'Oost-Vlaanderen' },
  hub: { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Test Hub' },
  highDemand: false,
  hasActiveMembers: true,
  createdAt: null,
  updatedAt: null,
  ...data,
});

describe('mapCarOnboardingToGsheetRow', () => {
  it('maps onboarding and simulation fields into spreadsheet columns', () => {
    const onboarding = completeCarOnboarding({
      carPcId: 1302,
      street: 'Luchterenkerkweg',
      houseNumber: '67',
      phone: '493191772',
      brand: { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Opel' },
      carType: { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Astra Sports Tour' },
      carValue: 4000,
      depreciationCostKm: 0.05,
      mileage: 158000,
      firstRegisteredAt: new Date('2012-06-01'),
      gsheetRowNumber: 10,
    });
    const sim = simulation({
      ownerKmPerYear: 10000,
      resultAvgSharedKm: 9360,
      resultMinSharedKm: 6960,
      resultMaxSharedKm: 41400,
      resultInsuranceCostPerYear: 455,
      resultCode: SimulationResultCode.NOT_OK,
    });

    const row = mapCarOnboardingToGsheetRow({
      onboarding,
      simulation: sim,
      town: town(),
      hub: hub(),
      fuelCode: 'diesel',
      ownerName: 'Myriam De Coster',
      ownerEmail: 'myriamdecoster@hotmail.com',
      rowNumber: 10,
    });

    expect(row.Rijnr).toBe(11);
    expect(row['Nummer van de inschrijving']).toBe(1302);
    expect(row['Naam van de ontlener']).toBe('Myriam De Coster');
    expect(row.Voornaam).toBe('Myriam');
    expect(row['Postcode en Woonplaats']).toBe('9031 Drongen');
    expect(row.Adres).toBe('Luchterenkerkweg 67');
    expect(row['GSM Nummer']).toBe('493191772');
    expect(row['Email Address']).toBe('myriamdecoster@hotmail.com');
    expect(row['KM stand begin']).toBe(158000);
    expect(row['Aantal km eigenaar per jaar']).toBe(10000);
    expect(row['Waarde volgens Degage']).toBe(4000);
    expect(row['Auto + Type']).toBe('Opel Astra Sports Tour');
    expect(row['Afschrijving per km']).toBe('0,05');
    expect(row.Brandstof).toBe('DIESEL');
    expect(row.Bouwjaar).toBe(2012);
    expect(row['Nieuwe stad ?']).toBe('neen');
    expect(row['Laatste PDF']).toBe('');
    expect(row['Gemiddeld aantal km gedeeld']).toBe(9360);
    expect(row['Terugverdien bedrag gemiddeld']).toBe(468);
    expect(row['Minimaal terugverdiend']).toBe(348);
    expect(row['Maximaal terugverdiend']).toBe(2070);
    expect(row['Verzekeringspremie per jaar']).toBe(455);
    expect(row['Afgeschreven op km']).toBe(238000);
    expect(row['Waarde exclusief']).toBe(3306);
    expect(row['Dropdownlist zoek auto']).toBe('1302 Myriam De Coster Opel-Astra Sports Tour DIESEL NOK');
    expect(row.Beoordeling).toBe('NOK');
  });

  it('marks towns without active members as new', () => {
    const row = mapCarOnboardingToGsheetRow({
      onboarding: completeCarOnboarding({ carValue: 1210, depreciationCostKm: 0.1 }),
      simulation: simulation({ resultCode: SimulationResultCode.CATEGORY_A }),
      town: town({ hasActiveMembers: false }),
      hub: hub(),
      fuelCode: 'electric',
      ownerName: 'Freya De Rave',
      ownerEmail: 'freya@example.com',
      rowNumber: null,
    });

    expect(row['Nieuwe stad ?']).toBe('ja');
    expect(row['Afgeschreven op km']).toBe(320000);
    expect(row['Waarde exclusief']).toBe(1000);
    expect(row.Beoordeling).toBe('Cat A');
    expect(row.Rijnr).toBe('');
  });

  it('throws for unknown fuel codes', () => {
    expect(() =>
      mapCarOnboardingToGsheetRow({
        onboarding: completeCarOnboarding(),
        simulation: simulation(),
        town: town(),
        hub: hub(),
        fuelCode: 'petrol',
        ownerName: 'Test',
        ownerEmail: 'test@example.com',
        rowNumber: null,
      }),
    ).toThrow(CarOnboardingGsheetMappingError);
  });
});
