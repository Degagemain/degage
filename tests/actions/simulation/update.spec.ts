import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/simulation/read', () => ({
  readSimulation: vi.fn(),
}));

vi.mock('@/storage/simulation/simulation.update', () => ({
  dbSimulationUpdate: vi.fn(),
}));

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

vi.mock('@/context/request-context', () => ({
  getRequestLocale: () => 'en',
}));

import { updateSimulation } from '@/actions/simulation/update';
import { readSimulation } from '@/actions/simulation/read';
import { dbSimulationUpdate } from '@/storage/simulation/simulation.update';
import { sendTemplatedEmail } from '@/integrations/resend';
import { SimulationResultCode } from '@/domain/simulation.model';
import { simulation } from '../../builders/simulation.builder';

const simId = '550e8400-e29b-41d4-a716-446655440000';

describe('updateSimulation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists email and sends when eligible and email is new', async () => {
    const base = simulation({
      id: simId,
      email: null,
      resultCode: SimulationResultCode.CATEGORY_A,
      error: null,
      town: { id: 't1', name: 'Town' },
      brand: { id: 'b1', name: 'Brand' },
      fuelType: { id: 'f1', name: 'Petrol' },
    });
    vi.mocked(readSimulation).mockResolvedValueOnce(base);
    vi.mocked(dbSimulationUpdate).mockImplementation(async (s) => s);

    await updateSimulation({ id: simId, email: 'user@example.com' });

    expect(dbSimulationUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: simId, email: 'user@example.com' }));
    expect(sendTemplatedEmail).toHaveBeenCalledTimes(2);
  });

  it('does not send when result is Not OK', async () => {
    const base = simulation({
      id: simId,
      email: null,
      resultCode: SimulationResultCode.NOT_OK,
      error: null,
    });
    vi.mocked(readSimulation).mockResolvedValueOnce(base);
    vi.mocked(dbSimulationUpdate).mockImplementation(async (s) => s);

    await updateSimulation({ id: simId, email: 'user@example.com' });

    expect(sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('does not send when simulation has engine error', async () => {
    const base = simulation({
      id: simId,
      email: null,
      resultCode: SimulationResultCode.MANUAL_REVIEW,
      error: 'boom',
    });
    vi.mocked(readSimulation).mockResolvedValueOnce(base);
    vi.mocked(dbSimulationUpdate).mockImplementation(async (s) => s);

    await updateSimulation({ id: simId, email: 'user@example.com' });

    expect(sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('does not send when email unchanged', async () => {
    const base = simulation({
      id: simId,
      email: 'same@example.com',
      resultCode: SimulationResultCode.CATEGORY_B,
      error: null,
    });
    vi.mocked(readSimulation).mockResolvedValueOnce(base);
    vi.mocked(dbSimulationUpdate).mockImplementation(async (s) => s);

    await updateSimulation({ id: simId, email: 'same@example.com' });

    expect(sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('does not send when email cleared', async () => {
    const base = simulation({
      id: simId,
      email: 'was@example.com',
      resultCode: SimulationResultCode.CATEGORY_A,
      error: null,
    });
    vi.mocked(readSimulation).mockResolvedValueOnce(base);
    vi.mocked(dbSimulationUpdate).mockImplementation(async (s) => s);

    await updateSimulation({ id: simId, email: null });

    expect(sendTemplatedEmail).not.toHaveBeenCalled();
  });
});
