import * as z from 'zod';

export const AnalyticsEvent = {
  USER_SIGNED_UP: 'user signed up',
  USER_LOGGED_IN: 'user logged in',
  SIMULATION: 'simulation',
  SUPPORT_CHAT_MESSAGE_SENT: 'support_chat_message_sent',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export const analyticsEventValues = [
  AnalyticsEvent.USER_SIGNED_UP,
  AnalyticsEvent.USER_LOGGED_IN,
  AnalyticsEvent.SIMULATION,
  AnalyticsEvent.SUPPORT_CHAT_MESSAGE_SENT,
] as const;

export const analyticsEventSchema = z.enum(analyticsEventValues);

export type AnalyticsSimulationStepEvent = `step_${number}`;

export type AnalyticsEventName = AnalyticsEvent | AnalyticsSimulationStepEvent;

export const analyticsSimulationStepEvent = (step: number): AnalyticsSimulationStepEvent => `step_${step}`;
