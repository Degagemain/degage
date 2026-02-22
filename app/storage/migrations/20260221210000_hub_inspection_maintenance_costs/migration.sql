-- AlterTable
ALTER TABLE "Hub" ADD COLUMN     "simInspectionCostPerYear" DECIMAL(65,30) NOT NULL DEFAULT 43,
ADD COLUMN     "simMaintenanceCostPerYear" DECIMAL(65,30) NOT NULL DEFAULT 950;
