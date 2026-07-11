import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type RoadAssistancePlanWithTranslations = Prisma.RoadAssistancePlanGetPayload<{ include: { translations: true } }>;

export const dbRoadAssistancePlanToDomain = (
  roadAssistancePlan: RoadAssistancePlanWithTranslations,
  locale: ContentLocale,
): RoadAssistancePlan => {
  const translation =
    roadAssistancePlan.translations.find((t) => t.locale === locale) ??
    roadAssistancePlan.translations.find((t) => t.locale === defaultContentLocale) ??
    roadAssistancePlan.translations[0];

  return {
    id: roadAssistancePlan.id,
    name: translation?.name ?? '',
    description: translation?.description ?? '',
    isActive: roadAssistancePlan.isActive,
    translations: roadAssistancePlan.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description,
    })),
    createdAt: roadAssistancePlan.createdAt,
    updatedAt: roadAssistancePlan.updatedAt,
  };
};

export const roadAssistancePlanToDbCreate = (roadAssistancePlan: RoadAssistancePlan): Prisma.RoadAssistancePlanCreateInput => {
  return {
    isActive: roadAssistancePlan.isActive,
    translations: {
      createMany: {
        data: roadAssistancePlan.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description,
        })),
      },
    },
  };
};

export const roadAssistancePlanToDbUpdate = (roadAssistancePlan: RoadAssistancePlan): Prisma.RoadAssistancePlanUpdateInput => {
  return {
    isActive: roadAssistancePlan.isActive,
    translations: {
      deleteMany: {},
      createMany: {
        data: roadAssistancePlan.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description,
        })),
      },
    },
  };
};
