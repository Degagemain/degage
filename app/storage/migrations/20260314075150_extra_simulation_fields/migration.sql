-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "error" TEXT,
ADD COLUMN     "resultDepreciationCostKm" DOUBLE PRECISION,
ADD COLUMN     "resultMaintenanceCostPerYear" DOUBLE PRECISION,
ADD COLUMN     "resultRoundedKmCost" DOUBLE PRECISION;
