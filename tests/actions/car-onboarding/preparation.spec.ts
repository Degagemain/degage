import { describe, expect, it } from 'vitest';
import { CarOnboardingCarValueStatus, CarOnboardingInPreparationStatus, CarOnboardingInsurerStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingInvalidCarValueStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-car-value-status.error';
import { CarOnboardingInvalidInsurerStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-insurer-status.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import {
  applyCarValueProposalTransition,
  applyPreparationStatus,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
  assertCarOnboardingPreparationReady,
  assertCarValueStatusIsProposal,
  assertInsurerStatusIsTodo,
  isCarValueSectionComplete,
  isPreparationReady,
} from '@/actions/car-onboarding/preparation';
import { CarOnboardingPreparationNotReadyError } from '@/actions/car-onboarding/car-onboarding-preparation-not-ready.error';
import { carOnboarding, completeCarOnboarding } from '../../builders/car-onboarding.builder';

describe('isCarValueSectionComplete', () => {
  it('returns true only when car value status is resolved', () => {
    expect(isCarValueSectionComplete(carOnboarding({ carValueStatus: CarOnboardingCarValueStatus.RESOLVED }))).toBe(true);
    expect(isCarValueSectionComplete(carOnboarding({ carValueStatus: CarOnboardingCarValueStatus.PROPOSAL }))).toBe(false);
  });
});

describe('isPreparationReady', () => {
  it('returns true only when car-info, user-info, car value, and insurer are complete', () => {
    expect(isPreparationReady(completeCarOnboarding())).toBe(true);
    expect(isPreparationReady(carOnboarding({ street: 'Main Street' }))).toBe(false);
    expect(
      isPreparationReady(
        completeCarOnboarding({
          carValueStatus: CarOnboardingCarValueStatus.PROPOSAL,
        }),
      ),
    ).toBe(false);
    expect(
      isPreparationReady(
        completeCarOnboarding({
          insurerStatus: CarOnboardingInsurerStatus.TODO,
        }),
      ),
    ).toBe(false);
  });
});

describe('assertCarOnboardingNotLocked', () => {
  it('throws when status is locked', () => {
    expect(() =>
      assertCarOnboardingNotLocked(
        carOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
        }),
      ),
    ).toThrow(CarOnboardingLockedError);
  });

  it('does not throw when status is open or ready', () => {
    expect(() => assertCarOnboardingNotLocked(carOnboarding())).not.toThrow();
    expect(() =>
      assertCarOnboardingNotLocked(
        carOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.READY,
        }),
      ),
    ).not.toThrow();
  });
});

describe('assertCarOnboardingPreparationReady', () => {
  it('throws when status is open', () => {
    expect(() => assertCarOnboardingPreparationReady(completeCarOnboarding())).toThrow(CarOnboardingPreparationNotReadyError);
  });

  it('throws when status is ready but sections are incomplete', () => {
    expect(() =>
      assertCarOnboardingPreparationReady(
        carOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.READY,
        }),
      ),
    ).toThrow(CarOnboardingPreparationNotReadyError);
  });

  it('does not throw when status is ready and preparation is complete', () => {
    expect(() =>
      assertCarOnboardingPreparationReady(
        completeCarOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.READY,
        }),
      ),
    ).not.toThrow();
  });
});

describe('assertCarOnboardingPartialUpdateAllowed', () => {
  const owner = { id: 'user-1', role: 'user', banned: false };
  const otherUser = { id: 'user-2', role: 'user', banned: false };
  const admin = { id: 'admin-1', role: 'admin', banned: false };

  it('allows the owner', () => {
    expect(() => assertCarOnboardingPartialUpdateAllowed(carOnboarding({ owner: { id: owner.id } }), owner)).not.toThrow();
  });

  it('allows admins regardless of owner', () => {
    expect(() => assertCarOnboardingPartialUpdateAllowed(carOnboarding({ owner: { id: owner.id } }), admin)).not.toThrow();
  });

  it('throws when user is neither owner nor admin', () => {
    expect(() => assertCarOnboardingPartialUpdateAllowed(carOnboarding({ owner: { id: owner.id } }), otherUser)).toThrow(
      CarOnboardingForbiddenError,
    );
  });

  it('throws when owner is unset and user is not admin', () => {
    expect(() => assertCarOnboardingPartialUpdateAllowed(carOnboarding(), owner)).toThrow(CarOnboardingForbiddenError);
  });
});

describe('assertCarValueStatusIsProposal', () => {
  it('throws when status is not proposal', () => {
    expect(() => assertCarValueStatusIsProposal(carOnboarding())).toThrow(CarOnboardingInvalidCarValueStatusError);
  });

  it('does not throw when status is proposal', () => {
    expect(() => assertCarValueStatusIsProposal(carOnboarding({ carValueStatus: CarOnboardingCarValueStatus.PROPOSAL }))).not.toThrow();
  });

  it('does not throw when status is todo with a positive car value', () => {
    expect(() =>
      assertCarValueStatusIsProposal(carOnboarding({ carValue: 10_000, carValueStatus: CarOnboardingCarValueStatus.TODO })),
    ).not.toThrow();
  });
});

describe('assertInsurerStatusIsTodo', () => {
  it('throws when status is not todo', () => {
    expect(() => assertInsurerStatusIsTodo(carOnboarding({ insurerStatus: CarOnboardingInsurerStatus.READY }))).toThrow(
      CarOnboardingInvalidInsurerStatusError,
    );
  });

  it('does not throw when status is todo', () => {
    expect(() => assertInsurerStatusIsTodo(carOnboarding({ insurerStatus: CarOnboardingInsurerStatus.TODO }))).not.toThrow();
  });
});

describe('applyCarValueProposalTransition', () => {
  it('moves todo to proposal when car value changes', () => {
    const existing = carOnboarding({ carValue: 10_000, carValueStatus: CarOnboardingCarValueStatus.TODO });
    const updated = carOnboarding({ carValue: 12_000, carValueStatus: CarOnboardingCarValueStatus.TODO });
    const result = applyCarValueProposalTransition(existing, updated);
    expect(result.carValueStatus).toBe(CarOnboardingCarValueStatus.PROPOSAL);
  });

  it('moves counter to proposal when car value changes', () => {
    const existing = carOnboarding({ carValue: 10_000, carValueStatus: CarOnboardingCarValueStatus.COUNTER });
    const updated = carOnboarding({ carValue: 12_000, carValueStatus: CarOnboardingCarValueStatus.COUNTER });
    const result = applyCarValueProposalTransition(existing, updated);
    expect(result.carValueStatus).toBe(CarOnboardingCarValueStatus.PROPOSAL);
  });

  it('leaves status unchanged when car value is unchanged and zero', () => {
    const existing = carOnboarding({ carValue: 0, carValueStatus: CarOnboardingCarValueStatus.TODO });
    const updated = carOnboarding({ carValue: 0, carValueStatus: CarOnboardingCarValueStatus.TODO });
    const result = applyCarValueProposalTransition(existing, updated);
    expect(result.carValueStatus).toBe(CarOnboardingCarValueStatus.TODO);
  });

  it('moves todo to proposal when car value is unchanged but positive', () => {
    const existing = carOnboarding({ carValue: 10_000, carValueStatus: CarOnboardingCarValueStatus.TODO });
    const updated = carOnboarding({ carValue: 10_000, carValueStatus: CarOnboardingCarValueStatus.TODO });
    const result = applyCarValueProposalTransition(existing, updated);
    expect(result.carValueStatus).toBe(CarOnboardingCarValueStatus.PROPOSAL);
  });

  it('leaves proposal unchanged when car value changes', () => {
    const existing = carOnboarding({ carValue: 10_000, carValueStatus: CarOnboardingCarValueStatus.PROPOSAL });
    const updated = carOnboarding({ carValue: 12_000, carValueStatus: CarOnboardingCarValueStatus.PROPOSAL });
    const result = applyCarValueProposalTransition(existing, updated);
    expect(result.carValueStatus).toBe(CarOnboardingCarValueStatus.PROPOSAL);
  });
});

describe('applyPreparationStatus', () => {
  it('sets ready when both sections are complete', () => {
    const result = applyPreparationStatus(completeCarOnboarding({ statusInPreparation: CarOnboardingInPreparationStatus.OPEN }));
    expect(result.statusInPreparation).toBe(CarOnboardingInPreparationStatus.READY);
  });

  it('sets open when preparation is incomplete', () => {
    const result = applyPreparationStatus(
      completeCarOnboarding({
        phone: null,
        statusInPreparation: CarOnboardingInPreparationStatus.READY,
      }),
    );
    expect(result.statusInPreparation).toBe(CarOnboardingInPreparationStatus.OPEN);
  });

  it('does not change locked status', () => {
    const result = applyPreparationStatus(
      completeCarOnboarding({
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );
    expect(result.statusInPreparation).toBe(CarOnboardingInPreparationStatus.LOCKED);
  });
});
