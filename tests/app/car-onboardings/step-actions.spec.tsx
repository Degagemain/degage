import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  getNextAccessibleStep: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/app/car-onboardings/lib/car-onboarding-context', () => ({
  useCarOnboarding: () => ({
    carOnboarding: {},
    basePath: '/app/car-onboardings/abc',
  }),
}));

vi.mock('@/app/car-onboardings/components/step-read-only-context', () => ({
  useStepReadOnly: () => false,
}));

vi.mock('@/app/car-onboardings/lib/step-navigation', () => ({
  getNextAccessibleStep: mocks.getNextAccessibleStep,
}));

import { StepActions } from '@/app/car-onboardings/components/step-actions';

describe('StepActions', () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.getNextAccessibleStep.mockReset();
    mocks.getNextAccessibleStep.mockReturnValue({ id: 'next-step' });
  });

  afterEach(() => {
    cleanup();
  });

  it('awaits save before navigating next', async () => {
    const onSave = vi.fn().mockResolvedValue(true);

    render(<StepActions stepId="insurer" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    await screen.findByRole('button', { name: /next/i });
    expect(mocks.push).toHaveBeenCalledWith('/app/car-onboardings/abc/next-step');
  });

  it('does not navigate when save fails', async () => {
    const onSave = vi.fn().mockResolvedValue(false);

    render(<StepActions stepId="insurer" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    await screen.findByRole('button', { name: /next/i });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('navigates to the overview when there is no next step', async () => {
    mocks.getNextAccessibleStep.mockReturnValue(null);
    const onSave = vi.fn().mockResolvedValue(true);

    render(<StepActions stepId="car-stickers" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    await screen.findByRole('button', { name: /next/i });
    expect(mocks.push).toHaveBeenCalledWith('/app/car-onboardings/abc');
  });
});
