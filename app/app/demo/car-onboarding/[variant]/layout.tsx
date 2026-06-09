'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { OnboardingProvider } from '../../lib/onboarding-context';
import type { OnboardingVariant } from '../../lib/types';

const VALID_VARIANTS: OnboardingVariant[] = ['new-car', 'regular'];

export default function CarOnboardingVariantLayout({ children, params }: { children: React.ReactNode; params: Promise<{ variant: string }> }) {
  const { variant } = use(params);

  if (!VALID_VARIANTS.includes(variant as OnboardingVariant)) {
    notFound();
  }

  return <OnboardingProvider variant={variant as OnboardingVariant}>{children}</OnboardingProvider>;
}
