import { describe, expect, it } from 'vitest';
import {
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInfoSessionStatus,
  CarOnboardingInsurerStatus,
  CarOnboardingRoadAssistancePlanStatus,
} from '@/domain/car-onboarding.model';
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
  it('always includes the insurer and road assistance plan steps', () => {
    expect(getStepsForRecord(carOnboarding({ isPurchased: true }))).toEqual([
      'play-connector',
      'info-session',
      'user-info',
      'car-info',
      'insurer',
      'road-assistance-plan',
      'car-value',
      'car-stickers',
      'share-start',
    ]);
    expect(getStepsForRecord(carOnboarding({ isPurchased: false }))).toEqual([
      'play-connector',
      'info-session',
      'user-info',
      'car-info',
      'insurer',
      'road-assistance-plan',
      'car-value',
      'car-stickers',
      'share-start',
    ]);
  });
});

describe('computeStepState', () => {
  it('blocks info session until play connector is complete', () => {
    expect(computeStepState('info-session', carOnboarding())).toBe('blocked');
    expect(computeStepState('info-session', withPlayConnector())).toBe('todo');
  });

  it('maps info session enrolled to pending', () => {
    expect(
      computeStepState(
        'info-session',
        withPlayConnector({
          infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
          infoSessionPcId: '1359',
        }),
      ),
    ).toBe('pending');
  });

  it('blocks user info until info session is enrolled', () => {
    expect(computeStepState('user-info', withPlayConnector())).toBe('blocked');
    expect(
      computeStepState(
        'user-info',
        withPlayConnector({
          infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
          infoSessionPcId: '1359',
        }),
      ),
    ).toBe('todo');
    expect(computeStepState('user-info', completeCarOnboarding())).toBe('done');
  });

  it('unlocks car-info when info session is enrolled, without user info', () => {
    const enrolledWithoutUserInfo = withPlayConnector({
      infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      infoSessionPcId: '1359',
      street: null,
    });
    expect(computeStepState('car-info', enrolledWithoutUserInfo)).toBe('todo');
    expect(computeStepState('car-info', completeCarOnboarding({ street: 'Main' }))).toBe('done');
  });

  it('does not block insurer or car-value until car info is complete', () => {
    const enrolled = withPlayConnector({
      infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      infoSessionPcId: '1359',
      street: null,
      brand: null,
      fuelType: null,
      carType: null,
      insurerStatus: CarOnboardingInsurerStatus.TODO,
      carValue: 10_000,
      carValueStatus: CarOnboardingCarValueStatus.TODO,
    });

    expect(computeStepState('insurer', enrolled)).toBe('todo');
    expect(computeStepState('car-value', enrolled)).toBe('todo');
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

  it('is read-only for info session when done but not when enrolled', () => {
    expect(
      isStepReadOnly(
        'info-session',
        withPlayConnector({
          infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
        }),
      ),
    ).toBe(false);
    expect(isStepReadOnly('info-session', completeCarOnboarding())).toBe(true);
  });

  it('stays editable for insurer when status is ready and preparation is open', () => {
    expect(isStepReadOnly('insurer', completeCarOnboarding({ insurerStatus: CarOnboardingInsurerStatus.READY }))).toBe(false);
  });

  it('stays editable for road assistance plan when status is ready and preparation is open', () => {
    expect(
      isStepReadOnly('road-assistance-plan', completeCarOnboarding({ roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.READY })),
    ).toBe(false);
  });
});

describe('isStepComplete', () => {
  it('returns true for completed play connector', () => {
    expect(isStepComplete('play-connector', completeCarOnboarding())).toBe(true);
    expect(isStepComplete('play-connector', carOnboarding())).toBe(false);
  });

  it('returns true for completed info session', () => {
    expect(isStepComplete('info-session', completeCarOnboarding())).toBe(true);
    expect(isStepComplete('info-session', withPlayConnector({ infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED }))).toBe(false);
  });

  it('returns true for completed user info', () => {
    expect(isStepComplete('user-info', completeCarOnboarding())).toBe(true);
    expect(isStepComplete('user-info', carOnboarding())).toBe(false);
  });

  it('returns true for car stickers whether or not extra stickers are saved', () => {
    expect(isStepComplete('car-stickers', completeCarOnboarding())).toBe(true);
    expect(isStepComplete('car-stickers', completeCarOnboarding({ carStickers: [] }))).toBe(true);
  });
});

describe('arePrerequisitesMet', () => {
  it('requires play connector before info session', () => {
    expect(arePrerequisitesMet('info-session', carOnboarding())).toBe(false);
    expect(arePrerequisitesMet('info-session', withPlayConnector())).toBe(true);
  });

  it('requires info session enrolled before user info', () => {
    expect(arePrerequisitesMet('user-info', withPlayConnector())).toBe(false);
    expect(
      arePrerequisitesMet(
        'user-info',
        withPlayConnector({ infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED, infoSessionPcId: '1359' }),
      ),
    ).toBe(true);
    expect(arePrerequisitesMet('user-info', completeCarOnboarding())).toBe(true);
  });

  it('requires info session enrolled before car info, insurer, car value, and car stickers', () => {
    expect(arePrerequisitesMet('car-info', withPlayConnector())).toBe(false);
    expect(arePrerequisitesMet('insurer', withPlayConnector())).toBe(false);
    expect(arePrerequisitesMet('car-value', withPlayConnector())).toBe(false);
    expect(arePrerequisitesMet('car-stickers', withPlayConnector())).toBe(false);
    const enrolled = withPlayConnector({
      infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      infoSessionPcId: '1359',
      street: null,
    });
    expect(arePrerequisitesMet('car-info', enrolled)).toBe(true);
    expect(arePrerequisitesMet('insurer', enrolled)).toBe(true);
    expect(arePrerequisitesMet('car-value', enrolled)).toBe(true);
    expect(arePrerequisitesMet('car-stickers', enrolled)).toBe(true);
  });

  it('requires insurer complete before share start', () => {
    const enrolled = withPlayConnector({
      infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      infoSessionPcId: '1359',
      insurerStatus: CarOnboardingInsurerStatus.TODO,
    });
    expect(arePrerequisitesMet('share-start', enrolled)).toBe(false);
    expect(
      arePrerequisitesMet(
        'share-start',
        withPlayConnector({
          infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
          infoSessionPcId: '1359',
          insurerStatus: CarOnboardingInsurerStatus.READY,
        }),
      ),
    ).toBe(true);
    expect(arePrerequisitesMet('share-start', completeCarOnboarding())).toBe(true);
  });
});

describe('share-start step', () => {
  it('is blocked until insurer is complete, then todo until a date is set', () => {
    const enrolled = withPlayConnector({
      infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      infoSessionPcId: '1359',
      insurerStatus: CarOnboardingInsurerStatus.TODO,
      shareStartDate: null,
    });
    expect(computeStepState('share-start', enrolled)).toBe('blocked');

    const insurerReady = {
      ...enrolled,
      insurerStatus: CarOnboardingInsurerStatus.READY,
      hasInsuranceContract: true,
      insurerContractStartedAt: new Date('2020-01-15'),
    };
    expect(computeStepState('share-start', insurerReady)).toBe('todo');
    expect(isStepComplete('share-start', insurerReady)).toBe(false);

    expect(computeStepState('share-start', completeCarOnboarding())).toBe('done');
    expect(isStepComplete('share-start', completeCarOnboarding())).toBe(true);
  });
});
