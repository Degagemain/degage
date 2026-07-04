import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryCarOnboardingInspectionCertificateUpload } from '@/api/car-onboardings/inspection-certificate-upload';
import { uploadCarOnboardingInspectionCertificate } from '@/actions/car-onboarding/upload-inspection-certificate';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryCarOnboardingInspectionCertificateUpload(
    request,
    id,
    uploadCarOnboardingInspectionCertificate,
    'car-onboardings-inspection-certificate',
    session.user,
  );
});
