import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { carOnboarding } from '../../builders/car-onboarding.builder';

const { translate, router, sessionState } = vi.hoisted(() => ({
  translate: (key: string) => key,
  router: { replace: vi.fn() },
  sessionState: { data: { user: { id: 'user-1' } }, isPending: false },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => translate,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/app/car-onboardings/550e8400-e29b-41d4-a716-446655440000/car-info',
  useRouter: () => router,
}));

vi.mock('@/app/lib/auth', () => ({
  authClient: {
    useSession: () => sessionState,
  },
}));

import { CarOnboardingProvider, useCarOnboarding } from '@/app/car-onboardings/lib/car-onboarding-context';

function StepProbe() {
  const { carOnboarding: record, reload } = useCarOnboarding();
  return (
    <div>
      <p>{record.plate}</p>
      <button type="button" onClick={() => void reload()}>
        reload
      </button>
    </div>
  );
}

const jsonResponse = (plate: string) => ({
  ok: true,
  status: 200,
  json: async () => carOnboarding({ plate }),
});

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve: (value: T) => resolve(value) };
};

describe('CarOnboardingProvider', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('keeps the step mounted while a reload is in flight', async () => {
    const initial = deferred<ReturnType<typeof jsonResponse>>();
    const refresh = deferred<ReturnType<typeof jsonResponse>>();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementationOnce(() => initial.promise)
        .mockImplementationOnce(() => refresh.promise),
    );

    render(
      <CarOnboardingProvider id="550e8400-e29b-41d4-a716-446655440000">
        <StepProbe />
      </CarOnboardingProvider>,
    );

    expect(document.querySelector('.animate-spin')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'reload' })).toBeNull();

    initial.resolve(jsonResponse('1-ABC-001'));
    expect(await screen.findByText('1-ABC-001')).toBeTruthy();
    expect(document.querySelector('.animate-spin')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'reload' }));

    expect(screen.getByText('1-ABC-001')).toBeTruthy();
    expect(document.querySelector('.animate-spin')).toBeNull();

    refresh.resolve(jsonResponse('1-ABC-002'));
    expect(await screen.findByText('1-ABC-002')).toBeTruthy();
    expect(screen.queryByText('1-ABC-001')).toBeNull();
  });
});
