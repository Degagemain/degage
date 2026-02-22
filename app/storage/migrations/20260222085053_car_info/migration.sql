-- CreateTable
CREATE TABLE "CarInfo" (
    "id" TEXT NOT NULL,
    "carTypeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cylinderCc" INTEGER NOT NULL,
    "co2Emission" INTEGER NOT NULL,
    "ecoscore" INTEGER NOT NULL,
    "euroNormId" TEXT,
    "consumption" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarInfo_carTypeId_year_key" ON "CarInfo"("carTypeId", "year");

-- AddForeignKey
ALTER TABLE "CarInfo" ADD CONSTRAINT "CarInfo_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarInfo" ADD CONSTRAINT "CarInfo_euroNormId_fkey" FOREIGN KEY ("euroNormId") REFERENCES "EuroNorm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
