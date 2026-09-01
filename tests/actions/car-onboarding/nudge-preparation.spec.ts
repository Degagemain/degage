import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.search', () => ({
  dbCarOnboardingSearchDueForPreparationNudge: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.update', () => ({
  dbCarOnboardingUpdateLastPreparationNudgeEmail: vi.fn(),
}));

vi.mock('@/storage/user/user.read', () => ({
  dbUserReadEmailAndLocale: vi.fn(),
}));

vi.mock('@/actions/email-template/send', () => ({
  sendEmailByCode: vi.fn().mockResolvedValue({ id: 'sent' }),
}));

vi.mock('@/actions/utils', () => ({
  getSupportReplyToEmail: () => 'support@example.com',
}));

import { sendEmailByCode } from '@/actions/email-template/send';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import {
  buildPublicCarOnboardingUrl,
  nudgeCarOnboardingPreparation,
  nudgeDueCarOnboardingPreparations,
} from '@/actions/car-onboarding/nudge-preparation';
import { CarOnboardingInPreparationStatus, PREPARATION_NUDGE_COOLDOWN_MS } from '@/domain/car-onboarding.model';
import { TemplatesEnum } from '@/domain/email-template.model';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { dbCarOnboardingSearchDueForPreparationNudge } from '@/storage/car-onboarding/car-onboarding.search';
import { dbCarOnboardingUpdateLastPreparationNudgeEmail } from '@/storage/car-onboarding/car-onboarding.update';
import { dbUserReadEmailAndLocale } from '@/storage/user/user.read';
import { carOnboarding } from '../../builders/car-onboarding.builder';

describe('nudgeCarOnboardingPreparation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const admin = { id: 'admin-1', role: 'admin', banned: false };
  const user = { id: 'user-1', role: 'user', banned: false };
  const id = '550e8400-e29b-41d4-a716-446655440000';
  const ownerId = 'owner-1';

  it('throws when caller is not admin', async () => {
    await expect(nudgeCarOnboardingPreparation(id, user)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(dbCarOnboardingReadWithRelations).not.toHaveBeenCalled();
  });

  it('sends the reminder and stores the timestamp when due', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id,
        owner: { id: ownerId },
      }),
    );
    vi.mocked(dbUserReadEmailAndLocale).mockResolvedValueOnce({ email: 'owner@example.com', locale: 'nl' });

    const result = await nudgeCarOnboardingPreparation(id, admin);

    expect(result).toEqual({ sent: true });
    expect(sendEmailByCode).toHaveBeenCalledWith({
      to: 'owner@example.com',
      code: TemplatesEnum.CarOnboardingPreparationNudgeEmail,
      locale: 'nl',
      variables: { BUTTON_URL: buildPublicCarOnboardingUrl(id) },
      replyTo: 'support@example.com',
    });
    expect(dbCarOnboardingUpdateLastPreparationNudgeEmail).toHaveBeenCalledWith(id, expect.any(Date));
  });

  it('does not send when preparation is ready, locked, or already confirmed', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id,
        owner: { id: ownerId },
        statusInPreparation: CarOnboardingInPreparationStatus.READY,
      }),
    );
    vi.mocked(dbUserReadEmailAndLocale).mockResolvedValueOnce({ email: 'owner@example.com', locale: 'en' });

    const result = await nudgeCarOnboardingPreparation(id, admin);

    expect(result).toEqual({ sent: false });
    expect(sendEmailByCode).not.toHaveBeenCalled();
    expect(dbCarOnboardingUpdateLastPreparationNudgeEmail).not.toHaveBeenCalled();
  });

  it('does not send when a nudge was sent within 72 hours', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id,
        owner: { id: ownerId },
        lastPreparationNudgeEmail: new Date(Date.now() - PREPARATION_NUDGE_COOLDOWN_MS + 60_000),
      }),
    );
    vi.mocked(dbUserReadEmailAndLocale).mockResolvedValueOnce({ email: 'owner@example.com', locale: 'en' });

    const result = await nudgeCarOnboardingPreparation(id, admin);

    expect(result).toEqual({ sent: false });
    expect(sendEmailByCode).not.toHaveBeenCalled();
  });

  it('does not send when the onboarding has no owner', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(carOnboarding({ id, owner: null }));

    const result = await nudgeCarOnboardingPreparation(id, admin);

    expect(result).toEqual({ sent: false });
    expect(dbUserReadEmailAndLocale).not.toHaveBeenCalled();
    expect(sendEmailByCode).not.toHaveBeenCalled();
  });
});

describe('nudgeDueCarOnboardingPreparations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends to each due onboarding', async () => {
    const first = carOnboarding({ id: '550e8400-e29b-41d4-a716-446655440001', owner: { id: 'o1' } });
    const second = carOnboarding({ id: '550e8400-e29b-41d4-a716-446655440002', owner: { id: 'o2' } });
    vi.mocked(dbCarOnboardingSearchDueForPreparationNudge).mockResolvedValueOnce([
      { onboarding: first, ownerEmail: 'one@example.com', ownerLocale: 'en' },
      { onboarding: second, ownerEmail: 'two@example.com', ownerLocale: 'fr' },
    ]);

    const result = await nudgeDueCarOnboardingPreparations(new Date('2026-08-19T12:00:00Z'));

    expect(result).toEqual({ sent: 2 });
    expect(sendEmailByCode).toHaveBeenCalledTimes(2);
    expect(dbCarOnboardingUpdateLastPreparationNudgeEmail).toHaveBeenCalledTimes(2);
  });

  it('continues when one send fails', async () => {
    const first = carOnboarding({ id: '550e8400-e29b-41d4-a716-446655440001', owner: { id: 'o1' } });
    const second = carOnboarding({ id: '550e8400-e29b-41d4-a716-446655440002', owner: { id: 'o2' } });
    vi.mocked(dbCarOnboardingSearchDueForPreparationNudge).mockResolvedValueOnce([
      { onboarding: first, ownerEmail: 'one@example.com', ownerLocale: 'en' },
      { onboarding: second, ownerEmail: 'two@example.com', ownerLocale: 'fr' },
    ]);
    vi.mocked(sendEmailByCode).mockRejectedValueOnce(new Error('resend down')).mockResolvedValueOnce({ id: 'ok' });

    const result = await nudgeDueCarOnboardingPreparations(new Date('2026-08-19T12:00:00Z'));

    expect(result).toEqual({ sent: 1 });
    expect(dbCarOnboardingUpdateLastPreparationNudgeEmail).toHaveBeenCalledTimes(1);
    expect(dbCarOnboardingUpdateLastPreparationNudgeEmail).toHaveBeenCalledWith(second.id, expect.any(Date));
  });
});
