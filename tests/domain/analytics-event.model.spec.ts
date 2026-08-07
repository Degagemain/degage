import { describe, expect, it } from 'vitest';
import { AnalyticsEvent, analyticsEventSchema, analyticsEventValues, analyticsSimulationStepEvent } from '@/domain/analytics-event.model';

describe('analyticsEventSchema', () => {
  it.each(analyticsEventValues)('accepts %s', (value) => {
    expect(analyticsEventSchema.parse(value)).toBe(value);
  });

  it('rejects unknown event names', () => {
    expect(analyticsEventSchema.safeParse('unknown_event').success).toBe(false);
  });
});

describe('AnalyticsEvent', () => {
  it('exposes stable PostHog event names', () => {
    expect(AnalyticsEvent.USER_SIGNED_UP).toBe('user signed up');
    expect(AnalyticsEvent.USER_LOGGED_IN).toBe('user logged in');
    expect(AnalyticsEvent.SIMULATION).toBe('simulation');
    expect(AnalyticsEvent.SUPPORT_CHAT_MESSAGE_SENT).toBe('support_chat_message_sent');
  });
});

describe('analyticsSimulationStepEvent', () => {
  it('builds step_N event names', () => {
    expect(analyticsSimulationStepEvent(0)).toBe('step_0');
    expect(analyticsSimulationStepEvent(3)).toBe('step_3');
  });
});
