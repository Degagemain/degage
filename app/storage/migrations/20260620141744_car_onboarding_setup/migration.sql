-- CreateEnum
CREATE TYPE "CarOnboardingInPreparationStatus" AS ENUM ('open', 'ready', 'locked');

-- CreateEnum
CREATE TYPE "CarOnboardingCarValueStatus" AS ENUM ('todo', 'proposal', 'counter', 'resolved');

-- CreateTable
CREATE TABLE "CarOnboarding" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "townId" TEXT,
    "phone" TEXT,
    "brandId" TEXT,
    "fuelTypeId" TEXT,
    "carTypeId" TEXT,
    "carTypeOther" TEXT,
    "isPurchased" BOOLEAN NOT NULL DEFAULT false,
    "purchasePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "carValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "carValueCounterProposal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "carValueCounterProposalMessage" TEXT,
    "carValueStatus" "CarOnboardingCarValueStatus" NOT NULL DEFAULT 'todo',
    "depreciationCostKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isNewCar" BOOLEAN NOT NULL DEFAULT false,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "firstRegisteredAt" TIMESTAMP(3),
    "seats" INTEGER NOT NULL DEFAULT 0,
    "isVan" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "simulationId" TEXT,
    "statusInPreparation" "CarOnboardingInPreparationStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarOnboarding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_townId_fkey" FOREIGN KEY ("townId") REFERENCES "Town"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "CarBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
