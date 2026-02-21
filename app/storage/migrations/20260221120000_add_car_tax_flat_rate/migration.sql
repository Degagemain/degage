-- CreateTable
CREATE TABLE "CarTaxFlatRate" (
    "id" TEXT NOT NULL,
    "fiscalRegionId" TEXT NOT NULL,
    "start" TIMESTAMP(3),
    "rate" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarTaxFlatRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarTaxFlatRate" ADD CONSTRAINT "CarTaxFlatRate_fiscalRegionId_fkey" FOREIGN KEY ("fiscalRegionId") REFERENCES "FiscalRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
