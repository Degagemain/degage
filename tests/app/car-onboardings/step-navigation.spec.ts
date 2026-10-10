import { describe, expect, it } from 'vitest';

import { CarOnboardingInfoSessionStatus, CarOnboardingInsurerStatus } from '@/domain/car-onboarding.model';
import { getNextAccessibleStep, getOrderedSteps } from '@/app/car-onboardings/lib/step-navigation';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

describe('preparation step order', () => {
  it('lists name and start date before car stickers', () => {
    expect(getOrderedSteps(carOnboarding()).map((step) => step.id)).toEqual([
      'play-connector',
      'info-session',
      'user-info',
      'car-info',
      'insurer',
      'road-assistance-plan',
      'car-value',
      'share-start',
      'car-stickers',
    ]);
  });

  it('continues from car value to name and start date, then car stickers, when insurer is done', () => {
    const onboarding = completeCarOnboarding({ carName: null, shareStartDate: null });

    expect(getNextAccessibleStep(onboarding, 'car-value')?.id).toBe('share-start');
    expect(getNextAccessibleStep(onboarding, 'share-start')?.id).toBe('car-stickers');
    expect(getNextAccessibleStep(onboarding, 'car-stickers')).toBeNull();
  });

  it('continues from play connector to user info when Degapp is not connected', () => {
    const onboarding = carOnboarding();

    expect(getNextAccessibleStep(onboarding, 'play-connector')?.id).toBe('user-info');
    expect(getNextAccessibleStep(onboarding, 'user-info')?.id).toBe('car-info');
    expect(getNextAccessibleStep(onboarding, 'car-info')?.id).toBe('insurer');
    expect(getNextAccessibleStep(onboarding, 'insurer')?.id).toBe('car-stickers');
  });

  it('skips name and start date until insurer is done', () => {
    const onboarding = carOnboarding({
      owner: { id: 'owner-1', hasPlayConnector: true },
      infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      infoSessionPcId: '1359',
      insurerStatus: CarOnboardingInsurerStatus.TODO,
    });

    expect(getNextAccessibleStep(onboarding, 'car-value')?.id).toBe('car-stickers');
  });
});
