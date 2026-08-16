import z, { ZodError, ZodSafeParseResult } from 'zod';
import { NextRequest } from 'next/server';

import { AppError } from '@/actions/app.error';
import { logger } from '@/lib/logger';

import { statusCodes } from './status-codes';

export { NotFoundError } from '@/actions/app.error';

export const isPrismaNotFoundError = (error: unknown): boolean => {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === 'P2025';
};

export const isPrismaForeignKeyError = (error: unknown): boolean => {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === 'P2003';
};

export const conflictResponse = (message: string = 'Resource is in use and cannot be deleted'): Response => {
  return Response.json({ code: 'conflict', errors: [{ message }] }, { status: statusCodes.CONFLICT });
};

const internalErrorResponse = (): Response => {
  return Response.json(
    { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
    { status: statusCodes.INTERNAL_SERVER_ERROR },
  );
};

const unexpectedErrorResponse = (error: unknown, helper: string): Response => {
  logger.exception(error, { helper });
  return internalErrorResponse();
};

export const appErrorResponse = (error: AppError): Response => {
  return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status: error.httpStatus });
};

export const responseFromCaughtError = (error: unknown): Response | null => {
  if (error instanceof ZodError) {
    return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
  }
  if (error instanceof AppError) {
    return appErrorResponse(error);
  }
  if (isPrismaNotFoundError(error)) {
    return notFoundResponse();
  }
  return null;
};

export type SafeRequestJsonResult = { data: unknown; errorResponse: null } | { data: null; errorResponse: Response };

export const safeParseRequestJson = async (request: Request | NextRequest): Promise<SafeRequestJsonResult> => {
  try {
    const data = await request.json();
    return { data, errorResponse: null };
  } catch {
    return {
      data: null,
      errorResponse: Response.json(
        { code: 'invalid_json', errors: [{ message: 'Invalid JSON in request body' }] },
        { status: statusCodes.BAD_REQUEST },
      ),
    };
  }
};

export const tryCreateResource = async <T>(createResource: (resource: T) => Promise<T>, resource: unknown): Promise<Response> => {
  try {
    const createdResource = await createResource(resource as T);
    return Response.json(createdResource, { status: statusCodes.CREATED });
  } catch (error) {
    return responseFromCaughtError(error) ?? unexpectedErrorResponse(error, 'tryCreateResource');
  }
};

export const badRequestResponseFromZod = <T>(parseResult: ZodSafeParseResult<T>): Response => {
  return Response.json(
    {
      code: 'invalid query parameters',
      errors: parseResult.error?.issues,
    },
    { status: statusCodes.BAD_REQUEST },
  );
};

export interface IdRouteParams {
  params: Promise<{ id: string }>;
}

export const noContentResponse = (): Response => {
  return new Response(null, { status: statusCodes.NO_CONTENT });
};

export const notFoundResponse = (message: string = 'Resource not found'): Response => {
  return Response.json({ code: 'not_found', errors: [{ message }] }, { status: statusCodes.NOT_FOUND });
};

export const unauthorizedResponse = (message: string = 'Authentication required'): Response => {
  return Response.json({ code: 'unauthorized', errors: [{ message }] }, { status: statusCodes.UNAUTHORIZED });
};

export const forbiddenResponse = (message: string = 'Access denied'): Response => {
  return Response.json({ code: 'forbidden', errors: [{ message }] }, { status: statusCodes.FORBIDDEN });
};

const attachmentDownloadResponse = (body: string, filename: string, contentType: string): Response => {
  return new Response(body, {
    status: statusCodes.OK,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};

export const attachmentDownloadJsonResponse = (body: string, filename: string = 'download.json'): Response => {
  return attachmentDownloadResponse(body, filename, 'application/json; charset=utf-8');
};

export const attachmentDownloadCsvResponse = (body: string, filename: string = 'download.csv'): Response => {
  return attachmentDownloadResponse(body, filename, 'text/csv; charset=utf-8');
};

const uuidSchema = z.uuid();

export const getIdFromRoute = async (route: IdRouteParams): Promise<string> => {
  const { id } = await route.params;
  return uuidSchema.parse(id);
};

export const tryReadResource = async <T>(readResource: (id: string) => Promise<T>, id: string): Promise<Response> => {
  try {
    const resource = await readResource(id);
    return Response.json(resource);
  } catch (error) {
    return responseFromCaughtError(error) ?? unexpectedErrorResponse(error, 'tryReadResource');
  }
};

export const tryDeleteResource = async (deleteResource: (id: string) => Promise<void>, id: string): Promise<Response> => {
  try {
    await deleteResource(id);
    return noContentResponse();
  } catch (error) {
    if (isPrismaForeignKeyError(error)) {
      return conflictResponse('Resource is linked to other records and cannot be deleted');
    }
    return responseFromCaughtError(error) ?? unexpectedErrorResponse(error, 'tryDeleteResource');
  }
};

export const tryUpdateResource = async <T>(
  request: NextRequest,
  route: IdRouteParams,
  updateResource: (resource: T) => Promise<T>,
): Promise<Response> => {
  const id = await getIdFromRoute(route);

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  const body = data as T;
  if ((body as { id?: string }).id !== id) {
    return Response.json(
      {
        code: 'id_mismatch',
        errors: [{ message: 'id in body does not match id in path' }],
      },
      { status: statusCodes.BAD_REQUEST },
    );
  }
  try {
    await updateResource(body);
    return noContentResponse();
  } catch (error) {
    return responseFromCaughtError(error) ?? unexpectedErrorResponse(error, 'tryUpdateResource');
  }
};
