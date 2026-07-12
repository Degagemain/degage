import type { NextRequest } from 'next/server';
import {
  type IdRouteParams,
  conflictResponse,
  getIdFromRoute,
  isPrismaForeignKeyError,
  isPrismaNotFoundError,
  noContentResponse,
  notFoundResponse,
  tryReadResource,
  tryUpdateResource,
} from '@/api/utils';
import { NotFoundError } from '@/api/utils';
import { CarStickerInUseError } from '@/actions/car-sticker/car-sticker-in-use.error';
import { deleteCarSticker } from '@/actions/car-sticker/delete';
import { updateCarSticker } from '@/actions/car-sticker/update';
import { readCarSticker } from '@/actions/car-sticker/read';
import { withAdmin, withAuth } from '@/api/with-context';
import { statusCodes } from '@/api/status-codes';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readCarSticker, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateCarSticker);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  try {
    await deleteCarSticker(id);
    return noContentResponse();
  } catch (error) {
    if (error instanceof CarStickerInUseError) {
      return conflictResponse(error.message);
    }
    if (isPrismaNotFoundError(error) || error instanceof NotFoundError) {
      return notFoundResponse();
    }
    if (isPrismaForeignKeyError(error)) {
      return conflictResponse('Resource is linked to other records and cannot be deleted');
    }
    logger.exception(error, { route: 'car-stickers-delete' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
