/*
  Warnings:

  - Added the required column `fiscalRegionId` to the `Province` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Province" ADD COLUMN     "fiscalRegionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FiscalRegion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarTaxEuroNormAdjustment" (
    "id" TEXT NOT NULL,
    "fiscalRegionId" TEXT NOT NULL,
    "euroNormGroup" INTEGER NOT NULL,
    "defaultAdjustment" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dieselAdjustment" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarTaxEuroNormAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarTaxBaseRate" (
    "id" TEXT NOT NULL,
    "fiscalRegionId" TEXT NOT NULL,
    "maxCc" INTEGER NOT NULL,
    "fiscalPk" INTEGER NOT NULL,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "rate" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarTaxBaseRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalRegionTranslation" (
    "id" TEXT NOT NULL,
    "fiscalRegionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FiscalRegionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalRegion_code_key" ON "FiscalRegion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalRegionTranslation_fiscalRegionId_locale_key" ON "FiscalRegionTranslation"("fiscalRegionId", "locale");

-- AddForeignKey
ALTER TABLE "CarTaxEuroNormAdjustment" ADD CONSTRAINT "CarTaxEuroNormAdjustment_fiscalRegionId_fkey" FOREIGN KEY ("fiscalRegionId") REFERENCES "FiscalRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarTaxBaseRate" ADD CONSTRAINT "CarTaxBaseRate_fiscalRegionId_fkey" FOREIGN KEY ("fiscalRegionId") REFERENCES "FiscalRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalRegionTranslation" ADD CONSTRAINT "FiscalRegionTranslation_fiscalRegionId_fkey" FOREIGN KEY ("fiscalRegionId") REFERENCES "FiscalRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Province" ADD CONSTRAINT "Province_fiscalRegionId_fkey" FOREIGN KEY ("fiscalRegionId") REFERENCES "FiscalRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
