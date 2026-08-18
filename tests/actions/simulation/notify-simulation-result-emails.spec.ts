import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/email-template/send', () => ({
  sendEmailByCode: vi.fn().mockResolvedValue({ id: 'sent' }),
}));

vi.mock('@/actions/utils', () => ({
  getSupportReplyToEmail: () => 'support@example.com',
}));

const { getRequestLocaleMock } = vi.hoisted(() => ({
  getRequestLocaleMock: vi.fn(() => 'en'),
}));

vi.mock('@/context/request-context', () => ({
  getRequestLocale: () => getRequestLocaleMock(),
}));

import { sendEmailByCode } from '@/actions/email-template/send';
import {
  buildAdminSimulationUrl,
  buildPublicSimulationUrl,
  notifySimulationResultEmails,
} from '@/actions/simulation/notify-simulation-result-emails';
import { TemplatesEnum } from '@/domain/email-template.model';
import type { Simulation } from '@/domain/simulation.model';
import { SimulationResultCode } from '@/domain/simulation.model';
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

    expect(sendEmailByCode).toHaveBeenCalledTimes(2);
    expect(sendEmailByCode).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        code: TemplatesEnum.SimulationResultsEmail,
        locale: 'en',
        variables: expect.objectContaining({
          SIMULATION_URL: buildPublicSimulationUrl(simId),
        }),
      }),
    );
    expect(sendEmailByCode).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        code: TemplatesEnum.SimulationResultsSupportEmail,
        variables: expect.objectContaining({
          BUTTON_URL: buildAdminSimulationUrl(simId),
          RECIPIENT_EMAIL: 'u@x.co',
        }),
      }),
    );
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

    expect(sendEmailByCode).toHaveBeenCalledTimes(2);
    expect(sendEmailByCode).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ code: TemplatesEnum.SimulationManualReviewEmail, locale: 'nl' }),
    );
    expect(sendEmailByCode).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ code: TemplatesEnum.SimulationManualReviewSupportEmail, locale: 'nl' }),
    );
  });

  it('no-ops without simulation id', async () => {
    const s: Simulation = { ...simulation({ resultCode: SimulationResultCode.CATEGORY_A, error: null }), id: null };
    await notifySimulationResultEmails(s, { recipientEmail: 'u@x.co' });
    expect(sendEmailByCode).not.toHaveBeenCalled();
  });
});
