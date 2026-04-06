import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/resend', async (importOriginal) => {
  const m = await importOriginal<typeof import('@/integrations/resend')>();
  return {
    ...m,
    sendTemplatedEmail: vi.fn().mockResolvedValue({ id: 'sent' }),
  };
});

vi.mock('@/actions/utils', () => ({
  getSupportReplyToEmail: () => 'support@example.com',
}));

const { getRequestLocaleMock } = vi.hoisted(() => ({
  getRequestLocaleMock: vi.fn(() => 'en'),
}));

vi.mock('@/context/request-context', () => ({
  getRequestLocale: () => getRequestLocaleMock(),
}));

import { notifySimulationResultEmails } from '@/actions/simulation/notify-simulation-result-emails';
import type { Simulation } from '@/domain/simulation.model';
import { SimulationResultCode } from '@/domain/simulation.model';
import { TemplatesEnum, sendTemplatedEmail } from '@/integrations/resend';
import { simulation } from '../../builders/simulation.builder';

const simId = '550e8400-e29b-41d4-a716-446655440000';

describe('notifySimulationResultEmails', () => {
  afterEach(() => {
    vi.clearAllMocks();
    getRequestLocaleMock.mockReset();
    getRequestLocaleMock.mockReturnValue('en');
  });

  it('uses success templates for category A', async () => {
    const s = simulation({
      id: simId,
      resultCode: SimulationResultCode.CATEGORY_A,
      error: null,
      brand: { id: 'b', name: 'B' },
      town: { id: 't', name: 'T' },
    });
    await notifySimulationResultEmails(s, { recipientEmail: 'u@x.co' });

    expect(sendTemplatedEmail).toHaveBeenCalledTimes(2);
    expect(sendTemplatedEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ template: TemplatesEnum.SimulationResultsEmail, locale: 'en' }),
    );
    expect(sendTemplatedEmail).toHaveBeenNthCalledWith(2, expect.objectContaining({ template: TemplatesEnum.SimulationResultsSupportEmail }));
  });

  it('uses manual-review templates for manual review', async () => {
    const s = simulation({
      id: simId,
      resultCode: SimulationResultCode.MANUAL_REVIEW,
      error: null,
      brand: { id: 'b', name: 'B' },
      town: { id: 't', name: 'T' },
    });
    getRequestLocaleMock.mockReturnValue('nl');
    await notifySimulationResultEmails(s, { recipientEmail: 'u@x.co' });

    expect(sendTemplatedEmail).toHaveBeenCalledTimes(2);
    expect(sendTemplatedEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ template: TemplatesEnum.SimulationManualReviewEmail, locale: 'nl' }),
    );
    expect(sendTemplatedEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ template: TemplatesEnum.SimulationManualReviewSupportEmail }),
    );
  });

  it('no-ops without simulation id', async () => {
    const s: Simulation = { ...simulation({ resultCode: SimulationResultCode.CATEGORY_A, error: null }), id: null };
    await notifySimulationResultEmails(s, { recipientEmail: 'u@x.co' });
    expect(sendTemplatedEmail).not.toHaveBeenCalled();
  });
});
