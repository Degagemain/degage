'use client';

import { use } from 'react';

import { PublicPage, PublicShell } from '@/app/components/public/public-shell';

import { CarOnboardingProvider } from '../lib/car-onboarding-context';

export default function CarOnboardingLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <PublicShell heroGlow>
      <PublicPage narrow>
        <CarOnboardingProvider id={id}>{children}</CarOnboardingProvider>
      </PublicPage>
    </PublicShell>
  );
}
