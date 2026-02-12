-- CreateTable
CREATE TABLE "FuelType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelTypeTranslation" (
    "id" TEXT NOT NULL,
    "fuelTypeId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FuelTypeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FuelType_code_key" ON "FuelType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FuelTypeTranslation_fuelTypeId_locale_key" ON "FuelTypeTranslation"("fuelTypeId", "locale");

-- AddForeignKey
ALTER TABLE "FuelTypeTranslation" ADD CONSTRAINT "FuelTypeTranslation_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
