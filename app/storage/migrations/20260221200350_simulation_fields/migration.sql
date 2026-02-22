/*
  Warnings:

  - You are about to drop the column `kmPrice` on the `InsurancePriceBenchmark` table. All the data in the column will be lost.
  - You are about to drop the column `maxMileageExclusive` on the `InsurancePriceBenchmark` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[year,maxCarPrice]` on the table `InsurancePriceBenchmark` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseRate` to the `InsurancePriceBenchmark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxCarPrice` to the `InsurancePriceBenchmark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `InsurancePriceBenchmark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerKmPerYear` to the `Simulation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "InsurancePriceBenchmark_year_maxMileageExclusive_key";

-- AlterTable
ALTER TABLE "InsurancePriceBenchmark" DROP COLUMN "kmPrice",
DROP COLUMN "maxMileageExclusive",
ADD COLUMN     "baseRate" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "maxCarPrice" INTEGER NOT NULL,
ADD COLUMN     "rate" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "ownerKmPerYear" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePriceBenchmark_year_maxCarPrice_key" ON "InsurancePriceBenchmark"("year", "maxCarPrice");
