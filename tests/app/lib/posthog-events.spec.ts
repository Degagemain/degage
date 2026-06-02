import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/lib/posthog', () => ({
  capture: vi.fn(),
}));

import { capture } from '@/app/lib/posthog';
import {
  getLoginDialogSurfaceFromPathname,
  getSimulationEntryFromReferrer,
  trackAuthSignInCompleted,
  trackLandingCtaClicked,
  trackLoginDialogOptionClicked,
  trackSimulationCompleted,
} from '@/app/lib/posthog-events';

afterEach(() => {
  vi.clearAllMocks();
});

describe('posthog-events', () => {
  it('tracks landing CTA clicks', () => {
    trackLandingCtaClicked('hero');
    expect(capture).toHaveBeenCalledWith('landing_cta_clicked', { cta: 'hero' });
  });

  it('tracks login dialog options', () => {
    trackLoginDialogOptionClicked('degapp');
    expect(capture).toHaveBeenCalledWith('login_dialog_option_clicked', { option: 'degapp' });
  });

  it('tracks auth sign-in completion', () => {
    trackAuthSignInCompleted('google');
    expect(capture).toHaveBeenCalledWith('auth_sign_in_completed', { method: 'google' });
  });

  it('tracks simulation completion', () => {
    trackSimulationCompleted('categoryA', 'existing');
    expect(capture).toHaveBeenCalledWith('simulation_completed', {
      result_code: 'categoryA',
      situation: 'existing',
    });
  });

  it('maps pathname to login dialog surface', () => {
    expect(getLoginDialogSurfaceFromPathname('/app/simulation')).toBe('simulation');
    expect(getLoginDialogSurfaceFromPathname('/app/faq/articles/x')).toBe('faq');
    expect(getLoginDialogSurfaceFromPathname('/app')).toBe('landing');
  });
});
