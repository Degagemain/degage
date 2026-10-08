'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import type { CarOnboarding } from '@/domain/car-onboarding.model';
import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { authClient } from '@/app/lib/auth';
import { buildPostSignInReturnPath, buildSignInUrlWithReturnPath } from '@/app/lib/sign-in-return-path';
import { InlineCopy } from '@/app/components/inline-copy';
import { PublicBtn } from '@/app/car-onboardings/components/public-ui';

type CarOnboardingContextValue = {
  carOnboarding: CarOnboarding;
  reload: () => Promise<void>;
  isLocked: boolean;
  basePath: string;
  isLoading: boolean;
  error: string | null;
};

const CarOnboardingContext = createContext<CarOnboardingContextValue | null>(null);

export function CarOnboardingProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const t = useTranslations('carOnboardingPublic');
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [carOnboarding, setCarOnboarding] = useState<CarOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<'forbidden' | 'load' | null>(null);
  const basePath = `/app/car-onboardings/${id}`;

  const redirectToSignIn = useCallback(() => {
    router.replace(buildSignInUrlWithReturnPath(buildPostSignInReturnPath(pathname, '')));
  }, [pathname, router]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setFailure(null);
    try {
      const response = await fetch(`/api/car-onboardings/${id}`);
      if (response.status === 401) {
        redirectToSignIn();
        return;
      }
      if (response.status === 403) {
        setFailure('forbidden');
        setCarOnboarding(null);
        return;
      }
      if (!response.ok) {
        setFailure('load');
        setCarOnboarding(null);
        return;
      }
      const data: CarOnboarding = await response.json();
      setCarOnboarding(data);
    } catch {
      setFailure('load');
      setCarOnboarding(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, redirectToSignIn]);

  const error = failure != null ? t(`errors.${failure}`) : null;

  useEffect(() => {
    if (isSessionPending) return;
    if (!session) {
      redirectToSignIn();
      return;
    }
    void load();
  }, [isSessionPending, session, load, redirectToSignIn]);

  const switchAccount = useCallback(async () => {
    await authClient.signOut();
    redirectToSignIn();
  }, [redirectToSignIn]);

  const value = useMemo((): CarOnboardingContextValue | null => {
    if (!carOnboarding) return null;
    return {
      carOnboarding,
      reload: load,
      isLocked: carOnboarding.statusInPreparation === CarOnboardingInPreparationStatus.LOCKED,
      basePath,
      isLoading,
      error,
    };
  }, [carOnboarding, load, basePath, isLoading, error]);

  if (isSessionPending || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#388e3c] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-destructive font-medium">{error}</p>
        {failure === 'forbidden' && session ? (
          <>
            <p>{t('errors.forbiddenSignedInAs', { email: session.user.email })}</p>
            <p>
              <InlineCopy>{t('errors.forbiddenHelp')}</InlineCopy>
            </p>
            <PublicBtn type="button" variant="secondary" onClick={() => void switchAccount()}>
              {t('errors.switchAccount')}
            </PublicBtn>
          </>
        ) : null}
      </div>
    );
  }

  if (!value) return null;

  return <CarOnboardingContext.Provider value={value}>{children}</CarOnboardingContext.Provider>;
}

export const useCarOnboarding = (): CarOnboardingContextValue => {
  const ctx = useContext(CarOnboardingContext);
  if (!ctx) {
    throw new Error('useCarOnboarding must be used within CarOnboardingProvider');
  }
  return ctx;
};
