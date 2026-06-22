import { describe, expect, it } from 'vitest';
import { CarOnboardingCarValueStatus, CarOnboardingInPreparationStatus, CarOnboardingInsurerStatus } from '@/domain/car-onboarding.model';
import {
  arePrerequisitesMet,
  computeStepState,
  getStepsForRecord,
  isStepComplete,
  isStepReadOnly,
} from '@/app/car-onboardings/lib/compute-step-state';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

const withPlayConnector = (data: Parameters<typeof carOnboarding>[0] = {}) =>
  carOnboarding({
    owner: { id: 'owner-1', hasPlayConnector: true },
    ...data,
  });

describe('getStepsForRecord', () => {
  it('includes play connector as the first step', () => {
    expect(getStepsForRecord(carOnboarding({ isPurchased: true }))).toEqual(['play-connector', 'user-info', 'car-info', 'car-value']);
    expect(getStepsForRecord(carOnboarding({ isPurchased: false }))).toEqual([
      'play-connector',
      'user-info',
      'car-info',
      'insurer',
      'car-value',
    ]);
  });
});

describe('computeStepState', () => {
  it('blocks user info until play connector is complete', () => {
    expect(computeStepState('user-info', carOnboarding())).toBe('blocked');
    expect(computeStepState('user-info', withPlayConnector())).toBe('todo');
  });

  it('blocks car-info until user info is complete', () => {
    expect(computeStepState('car-info', withPlayConnector({ street: null }))).toBe('blocked');
    expect(computeStepState('car-info', completeCarOnboarding({ street: 'Main' }))).toBe('done');
  });

  it('blocks car-value until insurer is complete', () => {
    const incompleteInsurer = completeCarOnboarding({
      insurerStatus: CarOnboardingInsurerStatus.TODO,
      carValueStatus: CarOnboardingCarValueStatus.TODO,
    });
    expect(computeStepState('car-value', incompleteInsurer)).toBe('blocked');
  });

  it('maps car value statuses', () => {
    const base = completeCarOnboarding({
      carValue: 10_000,
      carValueStatus: CarOnboardingCarValueStatus.TODO,
    });
    expect(computeStepState('car-value', base)).toBe('todo');

    expect(computeStepState('car-value', completeCarOnboarding({ carValue: 0, carValueStatus: CarOnboardingCarValueStatus.TODO }))).toBe(
      'pending',
    );

    expect(computeStepState('car-value', completeCarOnboarding({ carValueStatus: CarOnboardingCarValueStatus.PROPOSAL }))).toBe('todo');

    expect(computeStepState('car-value', completeCarOnboarding({ carValueStatus: CarOnboardingCarValueStatus.COUNTER }))).toBe('pending');

    expect(computeStepState('car-value', completeCarOnboarding({ carValueStatus: CarOnboardingCarValueStatus.RESOLVED }))).toBe('done');
  });
});

describe('isStepReadOnly', () => {
  it('is read-only when preparation is locked', () => {
    expect(isStepReadOnly('user-info', completeCarOnboarding({ statusInPreparation: CarOnboardingInPreparationStatus.LOCKED }))).toBe(true);
  });

  it('is read-only for play connector when already connected', () => {
    expect(isStepReadOnly('play-connector', completeCarOnboarding())).toBe(true);
    expect(isStepReadOnly('play-connector', withPlayConnector())).toBe(true);
  });

  it('is read-only for insurer when status is not todo', () => {
    expect(isStepReadOnly('insurer', completeCarOnboarding({ insurerStatus: CarOnboardingInsurerStatus.READY }))).toBe(true);
  });
});

describe('isStepComplete', () => {
  it('returns true for completed play connector', () => {
    expect(isStepComplete('play-connector', completeCarOnboarding())).toBe(true);
    expect(isStepComplete('play-connector', carOnboarding())).toBe(false);
  });

  it('returns true for completed user info', () => {
    expect(isStepComplete('user-info', completeCarOnboarding())).toBe(true);
    expect(isStepComplete('user-info', carOnboarding())).toBe(false);
  });
});

describe('arePrerequisitesMet', () => {
  it('requires play connector before user info', () => {
    expect(arePrerequisitesMet('user-info', carOnboarding())).toBe(false);
    expect(arePrerequisitesMet('user-info', withPlayConnector())).toBe(true);
  });

  it('requires user info before car info', () => {
    expect(arePrerequisitesMet('car-info', withPlayConnector())).toBe(false);
    expect(arePrerequisitesMet('car-info', completeCarOnboarding())).toBe(true);
  });
});
