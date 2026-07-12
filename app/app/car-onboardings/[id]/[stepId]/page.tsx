'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { isStepId } from '../../lib/types';
import { PlayConnectorStep } from '../../components/steps/play-connector-step';
import { InfoSessionStep } from '../../components/steps/info-session-step';
import { UserInfoStep } from '../../components/steps/user-info-step';
import { CarInfoStep } from '../../components/steps/car-info-step';
import { InsurerStep } from '../../components/steps/insurer-step';
import { RoadAssistancePlanStep } from '../../components/steps/road-assistance-plan-step';
import { CarValueStep } from '../../components/steps/car-value-step';
import { CarStickersStep } from '../../components/steps/car-stickers-step';

export default function CarOnboardingStepPage({ params }: { params: Promise<{ id: string; stepId: string }> }) {
  const { stepId } = use(params);

  if (!isStepId(stepId)) {
    notFound();
  }

  switch (stepId) {
    case 'play-connector':
      return <PlayConnectorStep />;
    case 'info-session':
      return <InfoSessionStep />;
    case 'user-info':
      return <UserInfoStep />;
    case 'car-info':
      return <CarInfoStep />;
    case 'insurer':
      return <InsurerStep />;
    case 'road-assistance-plan':
      return <RoadAssistancePlanStep />;
    case 'car-value':
      return <CarValueStep />;
    case 'car-stickers':
      return <CarStickersStep />;
    default:
      notFound();
  }
}
