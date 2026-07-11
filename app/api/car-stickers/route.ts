import { type NextRequest } from 'next/server';
import { searchCarStickers } from '@/actions/car-sticker/search';
import { createCarSticker } from '@/actions/car-sticker/create';
import { carStickerFilterSchema } from '@/domain/car-sticker.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (request: NextRequest) => {
  const filter = carStickerFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarStickers(filter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCarSticker, data);
});
