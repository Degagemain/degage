import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
  getNextAccessibleStep: () => ({ id: 'next-step' }),
}));

import { StepActions } from '@/app/car-onboardings/components/step-actions';

describe('StepActions', () => {
  afterEach(() => {
    cleanup();
  });

  it('awaits save before navigating next', async () => {
    const onSave = vi.fn().mockResolvedValue(true);

    render(<StepActions stepId="insurer" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    // router.push is called asynchronously after onSave resolves
    await screen.findByRole('button', { name: /next/i });
    expect(mockPush).toHaveBeenCalledWith('/app/car-onboardings/abc/next-step');
  });

  it('does not navigate when save fails', async () => {
    mockPush.mockClear();
    const onSave = vi.fn().mockResolvedValue(false);

    render(<StepActions stepId="insurer" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    await screen.findByRole('button', { name: /next/i });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
