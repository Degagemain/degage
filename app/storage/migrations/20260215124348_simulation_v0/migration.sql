-- CreateEnum
CREATE TYPE "SimulationResultCode" AS ENUM ('notOk', 'categoryA', 'categoryB', 'higherRate', 'manualReview');

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "fuelTypeId" TEXT NOT NULL,
    "carTypeId" TEXT,
    "carTypeOther" TEXT,
    "km" INTEGER NOT NULL,
    "firstRegisteredAt" TIMESTAMP(3) NOT NULL,
    "isVan" BOOLEAN NOT NULL DEFAULT false,
    "resultCode" "SimulationResultCode" NOT NULL,
    "estimatedPrice" DECIMAL(65,30),
    "steps" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "CarBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
