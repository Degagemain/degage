import { SystemParameter, SystemParameterCategory, SystemParameterType } from '@/domain/system-parameter.model';
import { $Enums, Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type SystemParameterWithTranslations = Prisma.SystemParameterGetPayload<{
  include: { translations: true; valueEuronorm: true };
}>;

export const dbSystemParameterToDomain = (param: SystemParameterWithTranslations, locale: ContentLocale): SystemParameter => {
  const translation =
    param.translations.find((t) => t.locale === locale) ??
    param.translations.find((t) => t.locale === defaultContentLocale) ??
    param.translations[0];

  return {
    id: param.id,
    code: param.code,
    category: param.category as unknown as SystemParameterCategory,
    type: param.type as unknown as SystemParameterType,
    name: translation?.name ?? param.code,
    description: translation?.description ?? '',
    translations: param.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description,
    })),
    valueNumber: param.valueNumber,
    valueNumberMin: param.valueNumberMin,
    valueNumberMax: param.valueNumberMax,
    valueEuronormId: param.valueEuronormId,
    createdAt: param.createdAt,
    updatedAt: param.updatedAt,
  };
};

export const systemParameterToDbCreate = (param: SystemParameter): Prisma.SystemParameterUncheckedCreateInput => {
  return {
    code: param.code,
    category: param.category as $Enums.SystemParameterCategory,
    type: param.type as $Enums.SystemParameterType,
    valueNumber: param.valueNumber ?? undefined,
    valueNumberMin: param.valueNumberMin ?? undefined,
    valueNumberMax: param.valueNumberMax ?? undefined,
    valueEuronormId: param.valueEuronormId ?? undefined,
    translations: {
      createMany: {
        data: param.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description,
        })),
      },
    },
  };
};
