export type StepId = 'play-connector' | 'info-session' | 'user-info' | 'car-info' | 'insurer' | 'road-assistance-plan' | 'car-value';

export type StepState = 'blocked' | 'todo' | 'pending' | 'done';

export const STEP_IDS: StepId[] = ['play-connector', 'info-session', 'user-info', 'car-info', 'insurer', 'road-assistance-plan', 'car-value'];

export const isStepId = (value: string): value is StepId => STEP_IDS.includes(value as StepId);
