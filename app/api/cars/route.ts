import { type NextRequest } from 'next/server';
import { searchCar } from '@/actions/car/search';
import { createCar } from '@/actions/car/create';
import { fromZodParseResult, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { carFilterSchema } from '@/domain/car.filter';

export async function GET(request: NextRequest) {
  const carFilter = carFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!carFilter.success) {
    return fromZodParseResult(carFilter);
  }
  const result = await searchCar(carFilter.data);
  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCar, data);
}
