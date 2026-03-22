-- AlterTable
ALTER TABLE "Hub" ADD COLUMN     "simAcceptedDepreciationCostKm" DECIMAL(65,30) NOT NULL DEFAULT 0.32,
ADD COLUMN     "simAcceptedElectricDepreciationCostKm" DECIMAL(65,30) NOT NULL DEFAULT 0.33,
ADD COLUMN     "simAcceptedPriceCategoryA" DECIMAL(65,30) NOT NULL DEFAULT 0.38,
ADD COLUMN     "simAcceptedPriceCategoryB" DECIMAL(65,30) NOT NULL DEFAULT 0.46,
ADD COLUMN     "simMaxPrice" INTEGER DEFAULT 35000;
