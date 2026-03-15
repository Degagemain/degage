/*
  Warnings:

  - You are about to drop the column `co2Emission` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `consumption` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `cylinderCc` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `ecoscore` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedPrice` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `euroNormCode` on the `Simulation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[carTypeId,year,estimateYear]` on the table `CarPriceEstimate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estimateYear` to the `CarPriceEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CarPriceEstimate" ADD COLUMN     "estimateYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Simulation" DROP COLUMN "co2Emission",
DROP COLUMN "consumption",
DROP COLUMN "cylinderCc",
DROP COLUMN "ecoscore",
DROP COLUMN "estimatedPrice",
DROP COLUMN "euroNormCode",
ADD COLUMN     "resultBenchmarkAvgKm" INTEGER,
ADD COLUMN     "resultBenchmarkMaxKm" INTEGER,
ADD COLUMN     "resultBenchmarkMinKm" INTEGER,
ADD COLUMN     "resultCc" INTEGER,
ADD COLUMN     "resultCo2" INTEGER,
ADD COLUMN     "resultConsumption" DOUBLE PRECISION,
ADD COLUMN     "resultEcoScore" INTEGER,
ADD COLUMN     "resultEuroNorm" TEXT,
ADD COLUMN     "resultInspectionCostPerYear" DOUBLE PRECISION,
ADD COLUMN     "resultInsuranceCostPerYear" DOUBLE PRECISION,
ADD COLUMN     "resultTaxCostPerYear" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "CarPriceEstimate_carTypeId_year_estimateYear_key" ON "CarPriceEstimate"("carTypeId", "year", "estimateYear");
