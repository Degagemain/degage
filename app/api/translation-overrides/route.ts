import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getTranslationCatalog } from '@/actions/translation-override/catalog';
import {
  deleteAllTranslationOverrides,
  deleteTranslationOverride,
  translationOverrideDeleteSchema,
} from '@/actions/translation-override/delete';
import { upsertTranslationOverride } from '@/actions/translation-override/upsert';
import { TranslationOverrideValidationError } from '@/actions/translation-override/validation';
import { safeParseRequestJson } from '@/api/utils';
import { withAdmin } from '@/api/with-context';
import { statusCodes } from '@/api/status-codes';

const internalErrorResponse = (): Response =>
  Response.json(
    { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
    { status: statusCodes.INTERNAL_SERVER_ERROR },
  );

const validationErrorResponse = (error: ZodError | TranslationOverrideValidationError): Response =>
  Response.json(
    {
      code: 'validation_error',
      errors:
        error instanceof ZodError
          ? error.issues
          : [
              {
                message: error.message,
                details: error.details.length > 0 ? error.details : undefined,
              },
            ],
    },
    { status: statusCodes.BAD_REQUEST },
  );

export const GET = withAdmin(async () => {
  const catalog = await getTranslationCatalog();
  return Response.json(catalog);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  try {
    const override = await upsertTranslationOverride(data as never);
    return Response.json(override, { status: statusCodes.OK });
  } catch (error) {
    if (error instanceof ZodError || error instanceof TranslationOverrideValidationError) {
      return validationErrorResponse(error);
    }
    return internalErrorResponse();
  }
});

export const DELETE = withAdmin(async (request: NextRequest) => {
  try {
    if (request.nextUrl.searchParams.get('scope') === 'all') {
      const deleted = await deleteAllTranslationOverrides();
      return Response.json({ deleted });
    }

    const parsed = translationOverrideDeleteSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    await deleteTranslationOverride(parsed.data);
    return new Response(null, { status: statusCodes.NO_CONTENT });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return internalErrorResponse();
  }
});
