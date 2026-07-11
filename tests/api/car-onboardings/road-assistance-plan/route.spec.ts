import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-onboarding/update-road-assistance-plan', () => ({
  updateCarOnboardingRoadAssistancePlan: vi.fn(),
}));

vi.mock('@/api/with-context', () => ({
  withAuth: (handler: (request: unknown, context: unknown, session: { user: { id: string } }) => Promise<Response>) => {
    return (request: unknown, context: unknown) => handler(request, context, { user: { id: 'user-1', role: 'user', banned: false } });
  },
}));

import { PUT } from '@/api/car-onboardings/[id]/road-assistance-plan/route';
import { updateCarOnboardingRoadAssistancePlan } from '@/actions/car-onboarding/update-road-assistance-plan';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('API Route - PUT /api/car-onboardings/[id]/road-assistance-plan', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 when road assistance plan is updated', async () => {
    vi.mocked(updateCarOnboardingRoadAssistancePlan).mockResolvedValueOnce(undefined);

    const request = {
      json: vi.fn().mockResolvedValue({
        hasExistingRoadAssistancePlan: false,
        roadAssistancePlan: { id: '550e8400-e29b-41d4-a716-446655440011' },
      }),
    } as any;

    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });

    expect(response.status).toBe(204);
    expect(updateCarOnboardingRoadAssistancePlan).toHaveBeenCalledWith(
      validId,
      {
        hasExistingRoadAssistancePlan: false,
        roadAssistancePlan: { id: '550e8400-e29b-41d4-a716-446655440011' },
      },
      expect.objectContaining({ id: 'user-1' }),
    );
  });
});
