'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { computeCurrentStage, shouldAutoSendContract } from './compute-stage';
import { createDefaultOnboardingState } from './default-state';
import { isPreparationSubflowReadOnly } from './is-subflow-read-only';
import type { OnboardingStage, OnboardingState, OnboardingVariant, SubflowId } from './types';

type OnboardingContextValue = {
  variant: OnboardingVariant;
  state: OnboardingState;
  currentStage: OnboardingStage;
  updateSubflow: <K extends SubflowId>(id: K, data: Partial<OnboardingState[K]>) => void;
  resetState: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function storageKey(variant: OnboardingVariant) {
  return `demo-car-onboarding-${variant}`;
}

function loadState(variant: OnboardingVariant): OnboardingState {
  if (typeof window === 'undefined') return createDefaultOnboardingState();
  try {
    const raw = localStorage.getItem(storageKey(variant));
    if (!raw) return createDefaultOnboardingState();
    return { ...createDefaultOnboardingState(), ...JSON.parse(raw) };
  } catch {
    return createDefaultOnboardingState();
  }
}

export function OnboardingProvider({ variant, children }: { variant: OnboardingVariant; children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => loadState(variant));
  const previousStageRef = useRef<OnboardingStage>('preparation');

  const currentStage = useMemo(() => computeCurrentStage(state, variant), [state, variant]);

  useEffect(() => {
    localStorage.setItem(storageKey(variant), JSON.stringify(state));
  }, [state, variant]);

  useEffect(() => {
    const previousStage = previousStageRef.current;
    if (shouldAutoSendContract(state, variant, previousStage, currentStage)) {
      setState((prev) => ({
        ...prev,
        contract: { ...prev.contract, sent: true },
      }));
    }
    previousStageRef.current = currentStage;
  }, [currentStage, state.contract.sent, variant, state]);

  const updateSubflow = useCallback(
    <K extends SubflowId>(id: K, data: Partial<OnboardingState[K]>) => {
      if (isPreparationSubflowReadOnly(id, variant, currentStage)) return;
      setState((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...data },
      }));
    },
    [variant, currentStage],
  );

  const resetState = useCallback(() => {
    const fresh = createDefaultOnboardingState();
    setState(fresh);
    localStorage.setItem(storageKey(variant), JSON.stringify(fresh));
    previousStageRef.current = 'preparation';
  }, [variant]);

  const value = useMemo(
    () => ({ variant, state, currentStage, updateSubflow, resetState }),
    [variant, state, currentStage, updateSubflow, resetState],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
