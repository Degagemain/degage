'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { isStepId } from '../../lib/types';
import { UserInfoStep } from '../../components/steps/user-info-step';
import { CarInfoStep } from '../../components/steps/car-info-step';
import { InsurerStep } from '../../components/steps/insurer-step';
import { CarValueStep } from '../../components/steps/car-value-step';

export default function CarOnboardingStepPage({ params }: { params: Promise<{ id: string; stepId: string }> }) {
  const { stepId } = use(params);

  if (!isStepId(stepId)) {
    notFound();
  }

  switch (stepId) {
    case 'user-info':
      return <UserInfoStep />;
    case 'car-info':
      return <CarInfoStep />;
    case 'insurer':
      return <InsurerStep />;
    case 'car-value':
      return <CarValueStep />;
    default:
      notFound();
  }
}
