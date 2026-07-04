import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryCarOnboardingPinkFormUpload } from '@/api/car-onboardings/pink-form-upload';
import { uploadCarOnboardingPinkForm } from '@/actions/car-onboarding/upload-pink-form';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryCarOnboardingPinkFormUpload(request, id, uploadCarOnboardingPinkForm, 'car-onboardings-pink-form', session.user);
});
