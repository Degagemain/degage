export type StepId = 'play-connector' | 'user-info' | 'car-info' | 'insurer' | 'car-value';

export type StepState = 'blocked' | 'todo' | 'pending' | 'done';

export const STEP_IDS: StepId[] = ['play-connector', 'user-info', 'car-info', 'insurer', 'car-value'];

export const isStepId = (value: string): value is StepId => STEP_IDS.includes(value as StepId);
