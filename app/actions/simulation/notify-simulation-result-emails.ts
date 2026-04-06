import { getSupportReplyToEmail } from '@/actions/utils';
import { getRequestLocale } from '@/context/request-context';
import type { Simulation } from '@/domain/simulation.model';
import { SimulationResultCode } from '@/domain/simulation.model';
import { TemplatesEnum, sendTemplatedEmail } from '@/integrations/resend';
import { type UILocale, defaultUILocale, uiLocales } from '@/i18n/locales';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import nl from '../../../messages/nl.json';

const messagesByLocale: Record<UILocale, typeof en> = { en, nl, fr };

function simulationResultLabel(locale: UILocale, code: SimulationResultCode): string {
  const entry = messagesByLocale[locale].simulation.resultCode as Record<string, string>;
  return entry[code] ?? code;
}

function nlResultLabel(code: SimulationResultCode): string {
  return simulationResultLabel('nl', code);
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

export function buildAdminSimulationUrl(simulationId: string): string {
  const base = (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/app/admin/simulations/${simulationId}`;
}

export function buildSupportTopAlertRow(isNewCar: boolean): string {
  if (!isNewCar) return '';
  const alert =
    '<tr><td style="padding:16px;background-color:#FDF3E0;border:1px solid #DECA80;' +
    'color:#181510;font-size:18px;font-weight:700;font-family:Arial,Helvetica,sans-serif;line-height:1.5;">' +
    'Nieuwe wagen</td></tr>';
  const spacer = '<tr><td style="padding:0;height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>';
  return alert + spacer;
}

/** Support-only (NL): prominent manual-review banner + optional new-car banner. */
export function buildManualReviewSupportTopRows(isNewCar: boolean): string {
  const manualBanner =
    '<tr><td style="padding:16px;background-color:#EAF1FA;border:1px solid #B5CDE5;' +
    'color:#181510;font-size:18px;font-weight:700;font-family:Arial,Helvetica,sans-serif;line-height:1.5;">' +
    'Handmatige beoordeling</td></tr>';
  const spacer = '<tr><td style="padding:0;height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>';
  return manualBanner + spacer + buildSupportTopAlertRow(isNewCar);
}

function buildSupportSummaryNl(s: Simulation, recipientEmail: string): string {
  const lines = [
    `Simulatie-ID: ${s.id}`,
    `E-mail ontvanger: ${recipientEmail}`,
    `Gemeente / stad: ${s.town?.name ?? '—'}`,
    `Merk: ${s.brand?.name ?? '—'}`,
    `Brandstof: ${s.fuelType?.name ?? '—'}`,
    `Autotype: ${s.carType?.name ?? s.carTypeOther ?? '—'}`,
    `Resultaat: ${nlResultLabel(s.resultCode)}`,
    `Nieuwe wagen: ${s.isNewCar ? 'ja' : 'nee'}`,
    `Eigen km/jaar: ${formatOptionalKm(s.ownerKmPerYear)}`,
    `Km-stand: ${s.mileage.toLocaleString('nl-BE')} km`,
    `Km-tarief (afgerond): ${formatOptionalEuro(s.resultRoundedKmCost)}`,
    `Afschrijving per km: ${formatOptionalEuro(s.resultDepreciationCostKm)}`,
    `Brandstofkost per 100 km: ${
      s.resultConsumption == null
        ? '—'
        : `${s.resultConsumption.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L/100km`
    }`,
    `Verzekering/jaar: ${formatOptionalEuro(s.resultInsuranceCostPerYear)}`,
    `Belasting/jaar: ${formatOptionalEuro(s.resultTaxCostPerYear)}`,
    `Onderhoud/jaar: ${formatOptionalEuro(s.resultMaintenanceCostPerYear)}`,
    `Keuring/jaar: ${formatOptionalEuro(s.resultInspectionCostPerYear)}`,
    `CO2: ${s.resultCo2 == null ? '—' : `${s.resultCo2} g/km`}`,
    `EcoScore: ${s.resultEcoScore == null ? '—' : String(s.resultEcoScore)}`,
    `EuroNorm: ${s.resultEuroNorm ?? '—'}`,
    `Benchmark km (min/avg/max): ${formatOptionalKm(s.resultBenchmarkMinKm)} / ${formatOptionalKm(
      s.resultBenchmarkAvgKm,
    )} / ${formatOptionalKm(s.resultBenchmarkMaxKm)}`,
  ];
  const value = s.isNewCar ? s.purchasePrice : s.resultEstimatedCarValue;
  lines.push(`Geschatte / koopprijs: ${formatOptionalEuro(value ?? null)}`);
  return lines.join('\n');
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
  const adminLink = buildAdminSimulationUrl(simulation.id);
  const userVariables = {
    SIMULATION_ID: simulation.id,
    BRAND_NAME: simulation.brand?.name ?? '—',
    TOWN_NAME: simulation.town?.name ?? '—',
    FUEL_TYPE: simulation.fuelType?.name ?? '—',
    RESULT_LABEL: simulationResultLabel(locale, simulation.resultCode),
    IS_NEW_CAR: localizedYesNo(locale, simulation.isNewCar),
    MILEAGE_KM: formatOptionalKm(simulation.mileage),
    CAR_VALUE: formatOptionalEuro(simulation.isNewCar ? simulation.purchasePrice : simulation.resultEstimatedCarValue),
    DEPRECIATION_RATE: formatOptionalEuro(simulation.resultDepreciationCostKm),
  };

  const isManualReview = simulation.resultCode === SimulationResultCode.MANUAL_REVIEW;

  if (isManualReview) {
    await sendTemplatedEmail({
      to: options.recipientEmail,
      template: TemplatesEnum.SimulationManualReviewEmail,
      locale,
      variables: userVariables,
      replyTo: getSupportReplyToEmail(),
    });

    await sendTemplatedEmail({
      to: getSupportReplyToEmail(),
      template: TemplatesEnum.SimulationManualReviewSupportEmail,
      locale: null,
      variables: {
        TOP_ALERT_ROW: buildManualReviewSupportTopRows(simulation.isNewCar),
        ADMIN_LINK: adminLink,
        RECIPIENT_EMAIL: options.recipientEmail,
        SUMMARY_NL: buildSupportSummaryNl(simulation, options.recipientEmail),
      },
      replyTo: options.recipientEmail,
    });
    return;
  }

  await sendTemplatedEmail({
    to: options.recipientEmail,
    template: TemplatesEnum.SimulationResultsEmail,
    locale,
    variables: userVariables,
    replyTo: getSupportReplyToEmail(),
  });

  await sendTemplatedEmail({
    to: getSupportReplyToEmail(),
    template: TemplatesEnum.SimulationResultsSupportEmail,
    locale: null,
    variables: {
      TOP_ALERT_ROW: buildSupportTopAlertRow(simulation.isNewCar),
      ADMIN_LINK: adminLink,
      RECIPIENT_EMAIL: options.recipientEmail,
      SUMMARY_NL: buildSupportSummaryNl(simulation, options.recipientEmail),
    },
    replyTo: options.recipientEmail,
  });
}
