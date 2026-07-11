import type { NextRequest } from 'next/server';
import { CarStickerImageNotFoundError } from '@/actions/car-sticker/car-sticker-image-not-found.error';
import { getCarStickerImageViewUrl } from '@/actions/car-sticker/get-image-view-url';
import { type IdRouteParams, getIdFromRoute, isPrismaNotFoundError, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withAuth } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (_request: NextRequest, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  try {
    const url = await getCarStickerImageViewUrl(id);
    return Response.json({ url });
  } catch (error) {
    if (error instanceof CarStickerImageNotFoundError || isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-stickers-image-view-url' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
