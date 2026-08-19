import { sendEmailByCode } from '@/actions/email-template/send';
import { getSupportReplyToEmail } from '@/actions/utils';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { type CarOnboarding, isCarOnboardingDueForPreparationNudge } from '@/domain/car-onboarding.model';
import { TemplatesEnum } from '@/domain/email-template.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { type UILocale, defaultUILocale, uiLocales } from '@/i18n/locales';
import { logger } from '@/lib/logger';
import {
  type CarOnboardingPreparationNudgeCandidate,
  dbCarOnboardingSearchDueForPreparationNudge,
} from '@/storage/car-onboarding/car-onboarding.search';
import { dbCarOnboardingUpdateLastPreparationNudgeEmail } from '@/storage/car-onboarding/car-onboarding.update';
import { dbUserReadEmailAndLocale } from '@/storage/user/user.read';

export type PreparationNudgeSendResult = {
  sent: boolean;
};

export const buildPublicCarOnboardingUrl = (onboardingId: string): string => {
  const base = (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/app/car-onboardings/${onboardingId}`;
};

const emailTemplateLocale = (raw: string | null | undefined): UILocale => {
  return uiLocales.includes(raw as UILocale) ? (raw as UILocale) : defaultUILocale;
};

const sendPreparationNudgeIfDue = async (
  onboarding: CarOnboarding,
  owner: { email: string; locale: string | null },
  now: Date,
): Promise<PreparationNudgeSendResult> => {
  if (onboarding.id == null) return { sent: false };
  if (owner.email.trim() === '') return { sent: false };
  if (!isCarOnboardingDueForPreparationNudge(onboarding, now)) return { sent: false };

  await sendEmailByCode({
    to: owner.email,
    code: TemplatesEnum.CarOnboardingPreparationNudgeEmail,
    locale: emailTemplateLocale(owner.locale),
    variables: {
      BUTTON_URL: buildPublicCarOnboardingUrl(onboarding.id),
    },
    replyTo: getSupportReplyToEmail(),
  });

  await dbCarOnboardingUpdateLastPreparationNudgeEmail(onboarding.id, now);
  return { sent: true };
};

export const nudgeCarOnboardingPreparation = async (id: string, caller: UserWithRole): Promise<PreparationNudgeSendResult> => {
  if (!isAdmin(caller)) {
    throw new CarOnboardingForbiddenError();
  }

  const onboarding = await readCarOnboarding(id);
  if (onboarding.owner?.id == null) {
    return { sent: false };
  }

  const owner = await dbUserReadEmailAndLocale(onboarding.owner.id);
  if (owner == null) {
    return { sent: false };
  }

  return sendPreparationNudgeIfDue(onboarding, owner, new Date());
};

const sendCandidateIfDue = async (candidate: CarOnboardingPreparationNudgeCandidate, now: Date): Promise<PreparationNudgeSendResult> => {
  try {
    return await sendPreparationNudgeIfDue(candidate.onboarding, { email: candidate.ownerEmail, locale: candidate.ownerLocale }, now);
  } catch (error) {
    logger.exception(error, { onboardingId: candidate.onboarding.id, phase: 'nudgeCarOnboardingPreparation' });
    return { sent: false };
  }
};

export const nudgeDueCarOnboardingPreparations = async (now: Date = new Date()): Promise<{ sent: number }> => {
  const candidates = await dbCarOnboardingSearchDueForPreparationNudge(now);
  let sent = 0;
  for (const candidate of candidates) {
    const result = await sendCandidateIfDue(candidate, now);
    if (result.sent) sent += 1;
  }
  return { sent };
};
