'use client';

import { ChevronRight } from 'lucide-react';

import { cn } from '@/app/lib/utils';

export type SubprocessFlowStep = {
  id: string;
  label: string;
};

interface CarOnboardingSubprocessFlowProps {
  steps: SubprocessFlowStep[];
  currentStepId: string;
  className?: string;
}

export function CarOnboardingSubprocessFlow({ steps, currentStepId, className }: CarOnboardingSubprocessFlowProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className={cn('text-muted-foreground flex flex-wrap items-center gap-y-0.5 text-sm', className)} aria-label="Subprocess progress">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {index > 0 ? <ChevronRight className="text-muted-foreground/35 mx-0.5 size-3 shrink-0" aria-hidden /> : null}
          <span
            className={cn(
              'whitespace-nowrap',
              index === activeIndex && 'text-foreground font-medium',
              index < activeIndex && 'text-muted-foreground',
              index > activeIndex && 'text-muted-foreground/45',
            )}
            aria-current={index === activeIndex ? 'step' : undefined}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
