import {
  CarOnboarding,
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInfoSessionStatus,
  CarOnboardingInsurerStatus,
  CarOnboardingRoadAssistancePlanStatus,
} from '@/domain/car-onboarding.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type CarOnboardingDb = Prisma.CarOnboardingGetPayload<object>;

export const carOnboardingRelationsInclude = {
  town: true,
  brand: { include: { translations: true } },
  fuelType: { include: { translations: true } },
  carType: true,
  insurer: true,
  roadAssistancePlan: { include: { translations: true } },
  owner: {
    include: {
      playConnector: {
        select: { id: true },
      },
    },
  },
  simulation: true,
  registrationCertificateFront: true,
  registrationCertificateBack: true,
  inspectionCertificate: true,
  pinkForm: true,
  stickerLinks: { include: { carSticker: true } },
} as const satisfies Prisma.CarOnboardingInclude;

type CarOnboardingWithRelations = Prisma.CarOnboardingGetPayload<{
  include: typeof carOnboardingRelationsInclude;
}>;

function townDisplayLabel(town: { zip: string; name: string; municipality: string }): string {
  return town.name !== town.municipality ? `${town.zip} ${town.name} (${town.municipality})` : `${town.zip} ${town.name}`;
}

const pickTranslationName = (translations: { locale: string; name: string }[], locale: ContentLocale): string => {
  const t = translations.find((x) => x.locale === locale) ?? translations.find((x) => x.locale === defaultContentLocale) ?? translations[0];
  return t?.name ?? '';
};

const mapStatusFromDb = (value: string): CarOnboardingInPreparationStatus => {
  return value as CarOnboardingInPreparationStatus;
};

const mapCarValueStatusFromDb = (value: string): CarOnboardingCarValueStatus => {
  return value as CarOnboardingCarValueStatus;
};

const mapInsurerStatusFromDb = (value: string): CarOnboardingInsurerStatus => {
  return value as CarOnboardingInsurerStatus;
};

const mapRoadAssistancePlanStatusFromDb = (value: string): CarOnboardingRoadAssistancePlanStatus => {
  return value as CarOnboardingRoadAssistancePlanStatus;
};

const mapInfoSessionStatusFromDb = (value: string): CarOnboardingInfoSessionStatus => {
  return value as CarOnboardingInfoSessionStatus;
};

const optionalRelationConnect = (relation: { id: string } | null | undefined): { connect: { id: string } } | { disconnect: true } => {
  return relation != null ? { connect: { id: relation.id } } : { disconnect: true };
};

export const dbCarOnboardingToDomain = (db: CarOnboardingDb): CarOnboarding => {
  return {
    id: db.id,
    street: db.street,
    town: db.townId != null ? { id: db.townId } : null,
    phone: db.phone,
    brand: db.brandId != null ? { id: db.brandId } : null,
    fuelType: db.fuelTypeId != null ? { id: db.fuelTypeId } : null,
    carType: db.carTypeId != null ? { id: db.carTypeId } : null,
    carTypeOther: db.carTypeOther,
    isPurchased: db.isPurchased,
    purchasePrice: Number(db.purchasePrice),
    carValue: Number(db.carValue),
    carValueCounterProposal: Number(db.carValueCounterProposal),
    carValueCounterProposalMessage: db.carValueCounterProposalMessage,
    carValueStatus: mapCarValueStatusFromDb(db.carValueStatus),
    hasInsuranceContract: db.hasInsuranceContract,
    insurer: db.insurerId != null ? { id: db.insurerId } : null,
    insurerStatus: mapInsurerStatusFromDb(db.insurerStatus),
    insurerContractStartedAt: db.insurerContractStartedAt,
    insurerAnnouncedPriceIncrease: db.insurerAnnouncedPriceIncrease,
    hasExistingRoadAssistancePlan: db.hasExistingRoadAssistancePlan,
    existingRoadAssistancePlanEndDate: db.existingRoadAssistancePlanEndDate,
    roadAssistancePlan: db.roadAssistancePlanId != null ? { id: db.roadAssistancePlanId } : null,
    roadAssistancePlanStatus: mapRoadAssistancePlanStatusFromDb(db.roadAssistancePlanStatus),
    infoSessionDate: db.infoSessionDate,
    infoSessionPcId: db.infoSessionPcId,
    infoSessionStatus: mapInfoSessionStatusFromDb(db.infoSessionStatus),
    depreciationCostKm: db.depreciationCostKm != null ? Number(db.depreciationCostKm) : 0,
    isNewCar: db.isNewCar,
    mileage: db.mileage,
    vin: db.vin,
    plate: db.plate,
    firstRegisteredAt: db.firstRegisteredAt,
    seats: db.seats,
    isVan: db.isVan,
    owner: db.ownerId != null ? { id: db.ownerId } : null,
    simulation: db.simulationId != null ? { id: db.simulationId } : null,
    registrationCertificateFront: db.registrationCertificateFrontId != null ? { id: db.registrationCertificateFrontId } : null,
    registrationCertificateBack: db.registrationCertificateBackId != null ? { id: db.registrationCertificateBackId } : null,
    inspectionCertificate: db.inspectionCertificateId != null ? { id: db.inspectionCertificateId } : null,
    pinkForm: db.pinkFormId != null ? { id: db.pinkFormId } : null,
    carStickers: [],
    shareStartDate: db.shareStartDate,
    statusInPreparation: mapStatusFromDb(db.statusInPreparation),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const dbCarOnboardingToDomainWithRelations = (db: CarOnboardingWithRelations, locale: ContentLocale): CarOnboarding => {
  return {
    ...dbCarOnboardingToDomain(db),
    town: db.town
      ? {
          id: db.townId!,
          name: townDisplayLabel(db.town),
        }
      : null,
    brand: db.brand
      ? {
          id: db.brandId!,
          name: pickTranslationName(db.brand.translations, locale),
        }
      : null,
    fuelType: db.fuelType
      ? {
          id: db.fuelTypeId!,
          name: pickTranslationName(db.fuelType.translations, locale),
        }
      : null,
    carType: db.carType
      ? {
          id: db.carType.id,
          name: db.carType.name,
        }
      : null,
    insurer: db.insurer
      ? {
          id: db.insurerId!,
          name: db.insurer.name,
        }
      : null,
    roadAssistancePlan: db.roadAssistancePlan
      ? {
          id: db.roadAssistancePlanId!,
          name: pickTranslationName(db.roadAssistancePlan.translations, locale),
        }
      : null,
    owner: db.owner
      ? {
          id: db.ownerId!,
          name: db.owner.name,
          hasPlayConnector: db.owner.playConnector != null,
        }
      : null,
    simulation: db.simulation
      ? {
          id: db.simulationId!,
          name: db.simulation.resultCode,
        }
      : null,
    registrationCertificateFront: db.registrationCertificateFront
      ? {
          id: db.registrationCertificateFrontId!,
          name: db.registrationCertificateFront.fileName,
        }
      : null,
    registrationCertificateBack: db.registrationCertificateBack
      ? {
          id: db.registrationCertificateBackId!,
          name: db.registrationCertificateBack.fileName,
        }
      : null,
    inspectionCertificate: db.inspectionCertificate
      ? {
          id: db.inspectionCertificateId!,
          name: db.inspectionCertificate.fileName,
        }
      : null,
    pinkForm: db.pinkForm
      ? {
          id: db.pinkFormId!,
          name: db.pinkForm.fileName,
        }
      : null,
    carStickers: db.stickerLinks.map((link) => ({
      id: link.carStickerId,
      name: link.carSticker.name,
    })),
  };
};

export const carOnboardingToDbCreate = (onboarding: CarOnboarding): Prisma.CarOnboardingCreateInput => {
  return {
    street: onboarding.street ?? undefined,
    town: onboarding.town != null ? { connect: { id: onboarding.town.id } } : undefined,
    phone: onboarding.phone ?? undefined,
    brand: onboarding.brand != null ? { connect: { id: onboarding.brand.id } } : undefined,
    fuelType: onboarding.fuelType != null ? { connect: { id: onboarding.fuelType.id } } : undefined,
    carType: onboarding.carType != null ? { connect: { id: onboarding.carType.id } } : undefined,
    carTypeOther: onboarding.carTypeOther ?? undefined,
    isPurchased: onboarding.isPurchased,
    purchasePrice: onboarding.purchasePrice,
    carValue: onboarding.carValue,
    carValueCounterProposal: onboarding.carValueCounterProposal,
    carValueCounterProposalMessage: onboarding.carValueCounterProposalMessage ?? undefined,
    carValueStatus: onboarding.carValueStatus,
    hasInsuranceContract: onboarding.hasInsuranceContract,
    insurer: onboarding.insurer != null ? { connect: { id: onboarding.insurer.id } } : undefined,
    insurerStatus: onboarding.insurerStatus,
    insurerContractStartedAt: onboarding.insurerContractStartedAt ?? undefined,
    insurerAnnouncedPriceIncrease: onboarding.insurerAnnouncedPriceIncrease,
    hasExistingRoadAssistancePlan: onboarding.hasExistingRoadAssistancePlan,
    existingRoadAssistancePlanEndDate: onboarding.existingRoadAssistancePlanEndDate ?? undefined,
    roadAssistancePlan: onboarding.roadAssistancePlan != null ? { connect: { id: onboarding.roadAssistancePlan.id } } : undefined,
    roadAssistancePlanStatus: onboarding.roadAssistancePlanStatus,
    infoSessionDate: onboarding.infoSessionDate ?? undefined,
    infoSessionPcId: onboarding.infoSessionPcId ?? undefined,
    infoSessionStatus: onboarding.infoSessionStatus,
    depreciationCostKm: onboarding.depreciationCostKm,
    isNewCar: onboarding.isNewCar,
    mileage: onboarding.mileage,
    vin: onboarding.vin ?? undefined,
    plate: onboarding.plate ?? undefined,
    firstRegisteredAt: onboarding.firstRegisteredAt ?? undefined,
    seats: onboarding.seats,
    isVan: onboarding.isVan,
    owner: onboarding.owner != null ? { connect: { id: onboarding.owner.id } } : undefined,
    simulation: onboarding.simulation != null ? { connect: { id: onboarding.simulation.id } } : undefined,
    registrationCertificateFront:
      onboarding.registrationCertificateFront != null ? { connect: { id: onboarding.registrationCertificateFront.id } } : undefined,
    registrationCertificateBack:
      onboarding.registrationCertificateBack != null ? { connect: { id: onboarding.registrationCertificateBack.id } } : undefined,
    inspectionCertificate: onboarding.inspectionCertificate != null ? { connect: { id: onboarding.inspectionCertificate.id } } : undefined,
    pinkForm: onboarding.pinkForm != null ? { connect: { id: onboarding.pinkForm.id } } : undefined,
    shareStartDate: onboarding.shareStartDate ?? undefined,
    statusInPreparation: onboarding.statusInPreparation,
  };
};

export const carOnboardingToDbUpdate = (onboarding: CarOnboarding): Prisma.CarOnboardingUpdateInput => {
  return {
    street: onboarding.street ?? undefined,
    town: optionalRelationConnect(onboarding.town),
    phone: onboarding.phone ?? undefined,
    brand: optionalRelationConnect(onboarding.brand),
    fuelType: optionalRelationConnect(onboarding.fuelType),
    carType: optionalRelationConnect(onboarding.carType),
    carTypeOther: onboarding.carTypeOther ?? undefined,
    isPurchased: onboarding.isPurchased,
    purchasePrice: onboarding.purchasePrice,
    carValue: onboarding.carValue,
    carValueCounterProposal: onboarding.carValueCounterProposal,
    carValueCounterProposalMessage: onboarding.carValueCounterProposalMessage ?? undefined,
    carValueStatus: onboarding.carValueStatus,
    hasInsuranceContract: onboarding.hasInsuranceContract,
    insurer: optionalRelationConnect(onboarding.insurer),
    insurerStatus: onboarding.insurerStatus,
    insurerContractStartedAt: onboarding.insurerContractStartedAt ?? undefined,
    insurerAnnouncedPriceIncrease: onboarding.insurerAnnouncedPriceIncrease,
    hasExistingRoadAssistancePlan: onboarding.hasExistingRoadAssistancePlan,
    existingRoadAssistancePlanEndDate: onboarding.existingRoadAssistancePlanEndDate,
    roadAssistancePlan: optionalRelationConnect(onboarding.roadAssistancePlan),
    roadAssistancePlanStatus: onboarding.roadAssistancePlanStatus,
    infoSessionDate: onboarding.infoSessionDate,
    infoSessionPcId: onboarding.infoSessionPcId,
    infoSessionStatus: onboarding.infoSessionStatus,
    depreciationCostKm: onboarding.depreciationCostKm,
    isNewCar: onboarding.isNewCar,
    mileage: onboarding.mileage,
    vin: onboarding.vin ?? undefined,
    plate: onboarding.plate ?? undefined,
    firstRegisteredAt: onboarding.firstRegisteredAt ?? undefined,
    seats: onboarding.seats,
    isVan: onboarding.isVan,
    owner: optionalRelationConnect(onboarding.owner),
    simulation: optionalRelationConnect(onboarding.simulation),
    registrationCertificateFront: optionalRelationConnect(onboarding.registrationCertificateFront),
    registrationCertificateBack: optionalRelationConnect(onboarding.registrationCertificateBack),
    inspectionCertificate: optionalRelationConnect(onboarding.inspectionCertificate),
    pinkForm: optionalRelationConnect(onboarding.pinkForm),
    stickerLinks: {
      deleteMany: {},
      create: onboarding.carStickers.map((sticker) => ({
        carSticker: { connect: { id: sticker.id } },
      })),
    },
    shareStartDate: onboarding.shareStartDate,
    statusInPreparation: onboarding.statusInPreparation,
  };
};
