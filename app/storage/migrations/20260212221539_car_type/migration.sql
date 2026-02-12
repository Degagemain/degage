-- CreateTable
CREATE TABLE "CarType" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "fuelTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ecoscore" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarType" ADD CONSTRAINT "CarType_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "CarBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarType" ADD CONSTRAINT "CarType_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
