import type { NextRequest } from 'next/server';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { DocumentNotRecognizedError } from '@/actions/document/document-not-recognized.error';
import type { InspectionCertificateUploadFile } from '@/actions/car-onboarding/upload-inspection-certificate';
import { forbiddenResponse, isPrismaNotFoundError, noContentResponse, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { logger } from '@/lib/logger';
import type { UserWithRole } from '@/domain/role.model';

const parseUploadFile = async (request: NextRequest): Promise<InspectionCertificateUploadFile | Response> => {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return Response.json({ code: 'validation_error', errors: [{ message: 'A file field is required' }] }, { status: statusCodes.BAD_REQUEST });
  }

  const contentType = file.type?.trim() || 'application/octet-stream';
  const arrayBuffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : await new Response(file).arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  return {
    fileName: file.name,
    contentType,
    sizeBytes: body.length,
    body,
  };
};

export const tryCarOnboardingInspectionCertificateUpload = async (
  request: NextRequest,
  id: string,
  upload: (id: string, file: InspectionCertificateUploadFile, user: UserWithRole) => Promise<void>,
  routeName: string,
  user: UserWithRole,
): Promise<Response> => {
  const parsed = await parseUploadFile(request);
  if (parsed instanceof Response) {
    return parsed;
  }

  try {
    await upload(id, parsed, user);
    return noContentResponse();
  } catch (error) {
    if (error instanceof CarOnboardingLockedError || error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof DocumentNotRecognizedError) {
      return Response.json({ code: 'document_not_recognized', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof Error && (error.message.startsWith('Unsupported content type') || error.message.startsWith('File'))) {
      return Response.json({ code: 'validation_error', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: routeName });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
};
