import { Province } from '@/domain/province.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type ProvinceWithFiscalRegion = Prisma.ProvinceGetPayload<{
  include: { fiscalRegion: { include: { translations: true } } };
}>;

export const dbProvinceToDomain = (province: ProvinceWithFiscalRegion, locale: ContentLocale): Province => {
  const translation =
    province.fiscalRegion.translations.find((t) => t.locale === locale) ??
    province.fiscalRegion.translations.find((t) => t.locale === defaultContentLocale) ??
    province.fiscalRegion.translations[0];
  return {
    id: province.id,
    name: province.name,
    fiscalRegion: {
      id: province.fiscalRegion.id,
      name: translation?.name ?? province.fiscalRegion.code,
    },
    createdAt: province.createdAt,
    updatedAt: province.updatedAt,
  };
};

const provinceToDbFiscalRegionConnect = (fiscalRegionId: string) => ({ connect: { id: fiscalRegionId } });

export const provinceToDbCreate = (province: Province): Prisma.ProvinceCreateInput => {
  return {
    name: province.name,
    fiscalRegion: provinceToDbFiscalRegionConnect(province.fiscalRegion.id),
  };
};

export const provinceToDbUpdate = (province: Province): Prisma.ProvinceUpdateInput => {
  return {
    name: province.name,
    fiscalRegion: provinceToDbFiscalRegionConnect(province.fiscalRegion.id),
  };
};
