'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import type { CarOnboarding } from '@/domain/car-onboarding.model';
import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { authClient } from '@/app/lib/auth';
import { buildPostSignInReturnPath, buildSignInUrlWithReturnPath } from '@/app/lib/sign-in-return-path';

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
  const [error, setError] = useState<string | null>(null);
  const basePath = `/app/car-onboardings/${id}`;

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/car-onboardings/${id}`);
      if (response.status === 401) {
        router.replace(buildSignInUrlWithReturnPath(buildPostSignInReturnPath(pathname, '')));
        return;
      }
      if (response.status === 403) {
        setError(t('errors.forbidden'));
        setCarOnboarding(null);
        return;
      }
      if (!response.ok) {
        setError(t('errors.load'));
        setCarOnboarding(null);
        return;
      }
      const data: CarOnboarding = await response.json();
      setCarOnboarding(data);
    } catch {
      setError(t('errors.load'));
      setCarOnboarding(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, pathname, router, t]);

  useEffect(() => {
    if (isSessionPending) return;
    if (!session) {
      router.replace(buildSignInUrlWithReturnPath(buildPostSignInReturnPath(pathname, '')));
      return;
    }
    void load();
  }, [isSessionPending, session, load, pathname, router]);

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
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-destructive text-center font-medium">{error}</p>
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
