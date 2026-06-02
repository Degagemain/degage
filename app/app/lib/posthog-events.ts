import { capture } from '@/app/lib/posthog';

export type LandingCta = 'hero' | 'eligibility' | 'footer';
export type LoginDialogSurface = 'landing' | 'simulation' | 'faq';
export type LoginDialogOption = 'degapp' | 'onboarding';
export type AuthMethod = 'email' | 'google' | 'github';
export type SimulationEntry = 'landing' | 'direct' | 'dashboard';
export type SupportChatSurface = 'landing' | 'faq_fab' | 'simulation' | 'faq_article';
export type LocaleChangeSurface = 'header' | 'menu' | 'settings';
export type DashboardCard = 'simulation' | 'faq' | 'admin';
export type FaqArticleSource = 'hub' | 'group' | 'search';
export type ConfirmationMemberPath = 'infosessie' | 'lid' | 'nieuw';
export type ProviderAction = 'link' | 'unlink';

type EventProperties = Record<string, string | number | boolean | null>;

function track(event: string, properties?: EventProperties) {
  capture(event, properties);
}

export function trackLandingCtaClicked(cta: LandingCta) {
  track('landing_cta_clicked', { cta });
}

export function trackLoginDialogOpened(surface: LoginDialogSurface) {
  track('login_dialog_opened', { surface });
}

export function trackLoginDialogOptionClicked(option: LoginDialogOption) {
  track('login_dialog_option_clicked', { option });
}

export function trackAuthSignInCompleted(method: AuthMethod) {
  track('auth_sign_in_completed', { method });
}

export function trackAuthSignUpCompleted(method: AuthMethod) {
  track('auth_sign_up_completed', { method });
}

export function trackAuthSignInFailed(method: AuthMethod, errorCode: string) {
  track('auth_sign_in_failed', { method, error_code: errorCode });
}

export function trackAuthForgotPasswordSubmitted() {
  track('auth_forgot_password_submitted');
}

export function trackSimulationStarted(entry: SimulationEntry) {
  track('simulation_started', { entry });
}

export function trackSimulationCompleted(resultCode: string, situation: 'existing' | 'newCar' | null) {
  track('simulation_completed', { result_code: resultCode, situation });
}

export function trackSimulationConfirmationEmailSent(memberPath: ConfirmationMemberPath | null) {
  track('simulation_confirmation_email_sent', { member_path: memberPath });
}

export function trackSimulationCarInfoSubmitted(brandId: string | null, fuelTypeId: string | null) {
  track('simulation_car_info_submitted', { brand_id: brandId, fuel_type_id: fuelTypeId });
}

export function trackSimulationManualReviewRequested() {
  track('simulation_manual_review_requested');
}

export function trackSimulationRestarted(fromStep: number) {
  track('simulation_restarted', { from_step: fromStep });
}

export function trackSimulationCostScenarioViewed(scenarioIndex: number) {
  track('simulation_cost_scenario_viewed', { scenario_index: scenarioIndex });
}

export function trackSupportChatOpened(surface: SupportChatSurface) {
  track('support_chat_opened', { surface });
}

export function trackLocaleChanged(from: string, to: string, surface: LocaleChangeSurface) {
  track('locale_changed', { from, to, surface });
}

export function trackFaqSearchExecuted(queryLength: number, resultCount: number) {
  track('faq_search_executed', { query_length: queryLength, result_count: resultCount });
}

export function trackFaqArticleOpened(externalId: string, source: FaqArticleSource) {
  track('faq_article_opened', { external_id: externalId, source });
}

export function trackDashboardCardClicked(card: DashboardCard) {
  track('dashboard_card_clicked', { card });
}

export function trackAccountProviderLinked(provider: string, action: ProviderAction) {
  track('account_provider_linked', { provider, action });
}

export function trackNonDefaultLocaleWarningViewed(locale: string) {
  track('non_default_locale_warning_viewed', { locale });
}

export function getSimulationEntryFromReferrer(): SimulationEntry {
  if (typeof document === 'undefined') return 'direct';
  const ref = document.referrer;
  if (ref.includes('/app/dashboard')) return 'dashboard';
  if (ref.endsWith('/app') || ref.endsWith('/app/')) return 'landing';
  return 'direct';
}

export function getLoginDialogSurfaceFromPathname(pathname: string): LoginDialogSurface {
  if (pathname.startsWith('/app/simulation')) return 'simulation';
  if (pathname.startsWith('/app/faq')) return 'faq';
  return 'landing';
}
