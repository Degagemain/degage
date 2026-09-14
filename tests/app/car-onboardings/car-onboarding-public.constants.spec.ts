import { describe, expect, it } from 'vitest';

import { CAR_ONBOARDING_FAQ_TAG_ALL, carOnboardingFaqTags } from '@/app/car-onboardings/car-onboarding-public.constants';

describe('carOnboardingFaqTags', () => {
  it('returns the shared tag on the overview', () => {
    expect(carOnboardingFaqTags()).toEqual([CAR_ONBOARDING_FAQ_TAG_ALL]);
  });

  it('returns the shared tag plus the step tag on a detail page', () => {
    expect(carOnboardingFaqTags('play-connector')).toEqual(['car_onboarding_all', 'car_onboarding_play_connector']);
  });
});
