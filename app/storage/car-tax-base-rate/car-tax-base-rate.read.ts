import { CarTaxBaseRate } from '@/domain/car-tax-base-rate.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTaxBaseRateToDomain } from './car-tax-base-rate.mappers';

const dateInRangeWhere = (registrationDate: Date) => ({
  start: { lte: registrationDate },
  OR: [{ end: null }, { end: { gt: registrationDate } }],
});

/**
 * Returns the base rate for the given fiscal region and registration date (in [start, end)).
 * When maxCc is provided: rate with maxCc closest to and not above maxCc (order by maxCc desc).
 * When maxCc is null or undefined: rate with the highest maxCc for the date filter.
 * Returns null if no matching rate exists.
 */
export const dbCarTaxBaseRateFindByFiscalRegionDateAndCc = async (
  fiscalRegionId: string,
  registrationDate: Date,
  maxCc?: number | null,
): Promise<CarTaxBaseRate | null> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const dateWhere = dateInRangeWhere(registrationDate);
  const where = {
    fiscalRegionId,
    ...dateWhere,
    ...(maxCc != null ? { maxCc: { gte: maxCc } } : {}),
  };
  const row = await prisma.carTaxBaseRate.findFirst({
    where,
    include: { fiscalRegion: { include: { translations: true } } },
    orderBy: { maxCc: 'asc' },
  });
  return row ? dbCarTaxBaseRateToDomain(row, locale) : null;
};
