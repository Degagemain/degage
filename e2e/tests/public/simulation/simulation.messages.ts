export const SIMULATION_LOCALES = ['en', 'nl', 'fr'] as const;

export type SimulationLocale = (typeof SIMULATION_LOCALES)[number];

export type SimulationMessages = {
  situationHeading: string;
  carInfoHeading: string;
  successResultHeading: string;
  notOkResultHeading: string;
  existingCarTile: string;
  newCarTile: string;
  startSimulationCta: string;
  submitSimulationCta: string;
  townLabel: string;
  brandLabel: string;
  fuelTypeLabel: string;
  fuelTypeName: string;
  carTypeLabel: string;
  mileageLabel: string;
  ownerKmLabel: string;
  purchaseAmountLabel: string;
  categoryA: string;
};

export const simulationMessages: Record<SimulationLocale, SimulationMessages> = {
  en: {
    situationHeading: 'Does your car fit Dégage?',
    carInfoHeading: 'Tell us about your car',
    successResultHeading: 'Good news — your car is eligible',
    notOkResultHeading: 'This car is not eligible',
    existingCarTile: 'Check my current car',
    newCarTile: "A car I'm planning to buy",
    startSimulationCta: 'Start the simulation →',
    submitSimulationCta: 'Simulate my car →',
    townLabel: 'Town',
    brandLabel: 'Brand',
    fuelTypeLabel: 'Fuel type',
    fuelTypeName: 'Gasoline',
    carTypeLabel: 'Car type / model',
    mileageLabel: 'Mileage',
    ownerKmLabel: 'Km per year',
    purchaseAmountLabel: 'Purchase amount (incl. VAT)',
    categoryA: 'Category A',
  },
  nl: {
    situationHeading: 'Past jouw wagen bij Dégage?',
    carInfoHeading: 'Vertel ons over je wagen',
    successResultHeading: 'Goed nieuws — jouw wagen komt in aanmerking',
    notOkResultHeading: 'Deze wagen komt niet in aanmerking',
    existingCarTile: 'Mijn huidige wagen checken',
    newCarTile: 'Een wagen die ik ga kopen',
    startSimulationCta: 'Start de simulatie →',
    submitSimulationCta: 'Simuleer mijn wagen →',
    townLabel: 'Gemeente',
    brandLabel: 'Merk',
    fuelTypeLabel: 'Brandstoftype',
    fuelTypeName: 'Benzine',
    carTypeLabel: 'Wagentype / model',
    mileageLabel: 'Kilometerstand',
    ownerKmLabel: 'Km per jaar',
    purchaseAmountLabel: 'Aankoopbedrag (incl. btw)',
    categoryA: 'Categorie A',
  },
  fr: {
    situationHeading: 'Votre voiture convient-elle à Dégage?',
    carInfoHeading: 'Parlez-nous de votre voiture',
    successResultHeading: 'Bonne nouvelle — votre voiture est éligible',
    notOkResultHeading: "Cette voiture n'est pas éligible",
    existingCarTile: 'Vérifier ma voiture actuelle',
    newCarTile: 'Une voiture que je compte acheter',
    startSimulationCta: 'Lancer la simulation →',
    submitSimulationCta: 'Simuler ma voiture →',
    townLabel: 'Commune',
    brandLabel: 'Marque',
    fuelTypeLabel: 'Type de carburant',
    fuelTypeName: 'Essence',
    carTypeLabel: 'Type / modèle de voiture',
    mileageLabel: 'Kilométrage',
    ownerKmLabel: 'Km par an',
    purchaseAmountLabel: "Montant d'achat (TVA incl.)",
    categoryA: 'Catégorie A',
  },
};
