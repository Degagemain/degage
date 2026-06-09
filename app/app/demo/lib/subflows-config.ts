import type { OnboardingStage, OnboardingVariant, SubflowId } from './types';

export type SubflowDefinition = {
  id: SubflowId;
  stage: OnboardingStage;
  title: string;
  subtitle: string;
  description: string;
  infoText: string;
  requires: SubflowId[];
  requiresByVariant?: Partial<Record<OnboardingVariant, SubflowId[]>>;
  variants: OnboardingVariant[];
  tracksStatus: boolean;
  hasInputs: boolean;
};

export const SUBFLOW_DEFINITIONS: SubflowDefinition[] = [
  {
    id: 'degapp-account',
    stage: 'preparation',
    title: 'Degapp-account',
    subtitle: 'Koppel je Degapp-account',
    description: 'Degapp is het platform waar je boekingen beheert en contact houdt met gebruikers van je wagen.',
    infoText: 'Heb je al een Degapp-account? Koppel het hier. Nog geen account? Maak er een aan — dat is nodig voor de volgende stappen.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: true,
  },
  {
    id: 'info-session',
    stage: 'preparation',
    title: 'Infosessie',
    subtitle: 'Volg een live eigenaars-infosessie',
    description: 'Schrijf je in voor een infosessie en leer hoe delen werkt in jouw buurt.',
    infoText: 'Als eigenaar volg je een aparte infosessie — ook als je al lid bent. Kies een moment dat jou past en schrijf je in.',
    requires: ['degapp-account'],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: false,
  },
  {
    id: 'car-info',
    stage: 'preparation',
    title: 'Wagengegevens',
    subtitle: 'Geef de basisgegevens van je wagen door',
    description: 'We hebben enkele gegevens en documenten nodig om je wagen in het systeem op te nemen.',
    infoText: 'Vul de gegevens van je wagen zo volledig mogelijk in. Je kunt tussentijds opslaan en later verdergaan.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: true,
  },
  {
    id: 'insurance-info',
    stage: 'preparation',
    title: 'Verzekering',
    subtitle: 'Je huidige autoverzekering',
    description: 'Geef door bij welke verzekeraar je wagen vandaag verzekerd is en sinds wanneer.',
    infoText:
      'We hebben deze info nodig om je startdatum en overstap te plannen. ' +
      'Startte je polis minder dan een jaar geleden? Dan gelden er wachttijden voor opzeg.',
    requires: [],
    variants: ['regular'],
    tracksStatus: true,
    hasInputs: true,
  },
  {
    id: 'start-datum',
    stage: 'preparation',
    title: 'Startdatum',
    subtitle: 'Kies wanneer je wilt starten met delen',
    description: 'Leg de maand vast waarop je wagen beschikbaar wordt voor leden.',
    infoText: 'Je start altijd op de eerste van de maand. Kies wanneer je wagen beschikbaar wordt voor leden.',
    requires: ['insurance-info'],
    requiresByVariant: {
      'new-car': [],
    },
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: true,
  },
  {
    id: 'car-damage',
    stage: 'preparation',
    title: 'Bestaande schade',
    subtitle: "Foto's van bestaande schade",
    description: 'Documenteer schade die al op je wagen staat vóór je start met delen.',
    infoText: "Upload duidelijke foto's van krassen, deuken of andere schade. Zo weten we wat er al was vóór de eerste rit.",
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: false,
  },
  {
    id: 'instapwaarde',
    stage: 'preparation',
    title: 'Instapwaarde',
    subtitle: 'Afspraak over waardevermindering per gedeelde km',
    description: 'Bekijk hoe de waarde van je wagen daalt naarmate er meer gedeeld wordt.',
    infoText:
      'Op basis van je kilometerstand berekenen we een instapwaarde per gedeelde kilometer. Ga je akkoord, of wil je een tegenvoorstel doen?',
    requires: ['car-info', 'car-damage'],
    variants: ['regular'],
    tracksStatus: true,
    hasInputs: true,
  },
  {
    id: 'contract',
    stage: 'in_progress',
    title: 'Contract',
    subtitle: 'Teken je eigenaarscontract',
    description: 'Je contract wordt automatisch verstuurd zodra alle voorbereidingen af zijn.',
    infoText:
      'Controleer of je het contract hebt ontvangen. Ontbreekt het? Stuur het opnieuw. Na ondertekening kun je verder met de volgende stappen.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: false,
  },
  {
    id: 'insurance',
    stage: 'in_progress',
    title: 'Nieuwe verzekering',
    subtitle: 'Status van je nieuwe verzekeringscontract',
    description: 'Volg hier de opstart van je verzekering voor gedeeld gebruik.',
    infoText: 'Dit is een informatief overzicht. Je hoeft hier niets te doen — we regelen de overstap en houden je op de hoogte.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: false,
  },
  {
    id: 'parking-card',
    stage: 'in_progress',
    title: 'Parkeerkaart',
    subtitle: 'Aanvraag parkeerkaart',
    description: 'De gemeente verwerkt je aanvraag voor een parkeerkaart.',
    infoText: 'Je kunt de status hier volgen. De aanvraag loopt via de gemeente — je hoeft zelf niets in te dienen.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: false,
  },
  {
    id: 'admin-afhandeling',
    stage: 'in_progress',
    title: 'Administratieve afhandeling',
    subtitle: 'We ronden je onboarding administratief af',
    description: 'We handelen de onboarding administratief af.',
    infoText: 'Dégage voert enkele stappen uit om je wagen klaar te zetten. Je hoeft niets te doen — volg hier de voortgang.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: false,
  },
  {
    id: 'stickers',
    stage: 'ready_to_share',
    title: 'Stickers',
    subtitle: 'Kies je stickerkleur',
    description: 'Kies een sjabloon zodat leden je wagen herkennen in de straat.',
    infoText: 'Kies een kleur en bevestig je keuze. Daarna bestellen we de stickers voor je wagen.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: true,
    hasInputs: false,
  },
  {
    id: 'buddy',
    stage: 'ready_to_share',
    title: 'Buddy',
    subtitle: 'Je lokale contactpersoon',
    description: 'Een ervaren eigenaar staat klaar om je op weg te helpen.',
    infoText: 'Je buddy is je eerste aanspreekpunt in de buurt. Neem gerust contact op met vragen over delen, boekingen of de eerste weken.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: false,
    hasInputs: false,
  },
  {
    id: 'survey',
    stage: 'ready_to_share',
    title: 'Enquête',
    subtitle: 'Korte vragenlijst over je onboarding',
    description: 'Help ons de onboarding te verbeteren met je feedback.',
    infoText: 'De enquête duurt ongeveer drie minuten. Je antwoorden zijn anoniem en helpen ons het proces te verfijnen.',
    requires: [],
    variants: ['new-car', 'regular'],
    tracksStatus: false,
    hasInputs: false,
  },
];

export const STAGE_LABELS: Record<OnboardingStage, string> = {
  preparation: 'In voorbereiding',
  in_progress: 'Bezig',
  ready_to_share: 'Klaar om te delen',
};

export const STAGE_ORDER: OnboardingStage[] = ['preparation', 'in_progress', 'ready_to_share'];

export function getSubflowsForVariant(variant: OnboardingVariant): SubflowDefinition[] {
  return SUBFLOW_DEFINITIONS.filter((s) => s.variants.includes(variant));
}

export function getSubflowsForStage(variant: OnboardingVariant, stage: OnboardingStage): SubflowDefinition[] {
  return getSubflowsForVariant(variant).filter((s) => s.stage === stage);
}

export function getSubflowDefinition(id: SubflowId): SubflowDefinition | undefined {
  return SUBFLOW_DEFINITIONS.find((s) => s.id === id);
}

export const VARIANT_LABELS: Record<OnboardingVariant, { title: string; description: string }> = {
  'new-car': {
    title: 'Wagen die je koopt',
    description: 'Onboarding wanneer je een wagen aankoopt om te gaan delen.',
  },
  regular: {
    title: 'Bestaande wagen',
    description: 'Onboarding voor een wagen die je al in je bezit hebt.',
  },
};

export function getSubflowRequires(definition: SubflowDefinition, variant: OnboardingVariant): SubflowId[] {
  return definition.requiresByVariant?.[variant] ?? definition.requires;
}
