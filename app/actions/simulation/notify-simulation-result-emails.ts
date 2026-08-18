import { sendEmailByCode } from '@/actions/email-template/send';
import { getSupportReplyToEmail } from '@/actions/utils';
import { getRequestLocale } from '@/context/request-context';
import { TemplatesEnum } from '@/domain/email-template.model';
import type { Simulation } from '@/domain/simulation.model';
import { SimulationResultCode } from '@/domain/simulation.model';
import { type UILocale, defaultUILocale, uiLocales } from '@/i18n/locales';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import nl from '../../../messages/nl.json';

const messagesByLocale: Record<UILocale, typeof en> = { en, nl, fr };

function simulationResultLabel(locale: UILocale, code: SimulationResultCode): string {
  const entry = messagesByLocale[locale].simulation.resultCode as Record<string, string>;
  return entry[code] ?? code;
}

function localizedYesNo(locale: UILocale, value: boolean): string {
  if (locale === 'nl') return value ? 'Ja' : 'Nee';
  if (locale === 'fr') return value ? 'Oui' : 'Non';
  return value ? 'Yes' : 'No';
}

function formatOptionalEuro(value: number | null | undefined): string {
  if (value == null) return '—';
  return `€ ${value.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatOptionalKm(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value.toLocaleString('nl-BE')} km`;
}

function appBaseUrl(): string {
  return (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function buildAdminSimulationUrl(simulationId: string): string {
  return `${appBaseUrl()}/app/admin/simulations/${simulationId}`;
}

export function buildPublicSimulationUrl(simulationId: string): string {
  return `${appBaseUrl()}/app/simulation/${simulationId}`;
}

export function isSimulationEligibleForResultEmail(simulation: Simulation): boolean {
  return simulation.resultCode !== SimulationResultCode.NOT_OK && simulation.error == null;
}

function emailTemplateLocale(): UILocale {
  const raw = getRequestLocale();
  return uiLocales.includes(raw as UILocale) ? (raw as UILocale) : defaultUILocale;
}

export async function notifySimulationResultEmails(simulation: Simulation, options: { recipientEmail: string }): Promise<void> {
  if (simulation.id == null) {
    return;
  }

  const locale = emailTemplateLocale();
  const isManualReview = simulation.resultCode === SimulationResultCode.MANUAL_REVIEW;
  const isPurchased = localizedYesNo(locale, simulation.isPurchased);

  await sendEmailByCode({
    to: options.recipientEmail,
    code: isManualReview ? TemplatesEnum.SimulationManualReviewEmail : TemplatesEnum.SimulationResultsEmail,
    locale,
    variables: {
      SIMULATION_URL: buildPublicSimulationUrl(simulation.id),
      BRAND_NAME: simulation.brand?.name ?? '—',
      TOWN_NAME: simulation.town?.name ?? '—',
      FUEL_TYPE: simulation.fuelType?.name ?? '—',
      RESULT_LABEL: simulationResultLabel(locale, simulation.resultCode),
      IS_PURCHASED: isPurchased,
      MILEAGE_KM: formatOptionalKm(simulation.mileage),
      CAR_VALUE: formatOptionalEuro(simulation.isPurchased ? simulation.purchasePrice : simulation.resultEstimatedCarValue),
      DEPRECIATION_RATE: formatOptionalEuro(simulation.resultDepreciationCostKm),
    },
    replyTo: getSupportReplyToEmail(),
  });

  await sendEmailByCode({
    to: getSupportReplyToEmail(),
    code: isManualReview ? TemplatesEnum.SimulationManualReviewSupportEmail : TemplatesEnum.SimulationResultsSupportEmail,
    locale,
    variables: {
      BUTTON_URL: buildAdminSimulationUrl(simulation.id),
      RECIPIENT_EMAIL: options.recipientEmail,
      IS_PURCHASED: isPurchased,
    },
    replyTo: options.recipientEmail,
  });
}
