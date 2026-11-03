export type PrepStepId =
  | 'play-connector'
  | 'info-session'
  | 'user-info'
  | 'car-info'
  | 'insurer'
  | 'road-assistance-plan'
  | 'car-value'
  | 'share-start'
  | 'car-stickers';

export type TransitionStepId = 'contract';

export type StepId = PrepStepId | TransitionStepId;

export type StepState = 'blocked' | 'todo' | 'pending' | 'done';

export const PREP_STEP_IDS: PrepStepId[] = [
  'play-connector',
  'info-session',
  'user-info',
  'car-info',
  'insurer',
  'road-assistance-plan',
  'car-value',
  'share-start',
  'car-stickers',
];

export const STEP_IDS: StepId[] = [...PREP_STEP_IDS, 'contract'];

export const isStepId = (value: string): value is StepId => STEP_IDS.includes(value as StepId);
export const isPrepStepId = (value: string): value is PrepStepId => PREP_STEP_IDS.includes(value as PrepStepId);
