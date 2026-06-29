import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryCarOnboardingRegistrationCertificateUpload } from '@/api/car-onboardings/registration-certificate-upload';
import { uploadCarOnboardingRegistrationCertificate } from '@/actions/car-onboarding/upload-registration-certificate';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryCarOnboardingRegistrationCertificateUpload(
    request,
    id,
    'back',
    uploadCarOnboardingRegistrationCertificate,
    'car-onboardings-registration-certificate-back',
    session.user,
  );
});
