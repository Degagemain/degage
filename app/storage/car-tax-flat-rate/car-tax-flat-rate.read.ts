import { CarTaxFlatRate } from '@/domain/car-tax-flat-rate.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTaxFlatRateToDomain } from './car-tax-flat-rate.mappers';

/**
 * Returns the flat rate for the given fiscal region where the rate's start date
 * is before or on the registration date (closest such rate).
 * Returns null if no matching rate exists.
 */
export const dbCarTaxFlatRateFindByFiscalRegionAndRegistrationDate = async (
  fiscalRegionId: string,
  registrationDate: Date,
): Promise<CarTaxFlatRate | null> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const row = await prisma.carTaxFlatRate.findFirst({
    where: {
      fiscalRegionId,
      start: { lte: registrationDate },
    },
    include: { fiscalRegion: { include: { translations: true } } },
    orderBy: { start: 'desc' },
  });
  return row ? dbCarTaxFlatRateToDomain(row, locale) : null;
};
