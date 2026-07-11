import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryCarStickerImageUpload } from '@/api/car-stickers/image-upload';
import { uploadCarStickerImage } from '@/actions/car-sticker/upload-image';
import { withAdmin } from '@/api/with-context';

export const PUT = withAdmin(async (request: NextRequest, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryCarStickerImageUpload(request, id, uploadCarStickerImage, 'car-stickers-image');
});
