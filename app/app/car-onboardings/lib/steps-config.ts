import type { StepId } from './types';

export type StepDefinition = {
  id: StepId;
  titleKey: string;
  subtitleKey: string;
};

export const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 'user-info',
    titleKey: 'steps.userInfo.title',
    subtitleKey: 'steps.userInfo.subtitle',
  },
  {
    id: 'car-info',
    titleKey: 'steps.carInfo.title',
    subtitleKey: 'steps.carInfo.subtitle',
  },
  {
    id: 'insurer',
    titleKey: 'steps.insurer.title',
    subtitleKey: 'steps.insurer.subtitle',
  },
  {
    id: 'car-value',
    titleKey: 'steps.carValue.title',
    subtitleKey: 'steps.carValue.subtitle',
  },
];

export const getStepDefinition = (id: StepId): StepDefinition | undefined => STEP_DEFINITIONS.find((s) => s.id === id);
