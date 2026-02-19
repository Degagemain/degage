-- CreateTable
CREATE TABLE "CarPriceEstimate" (
    "id" TEXT NOT NULL,
    "carTypeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "rangeMin" DECIMAL(65,30) NOT NULL,
    "rangeMax" DECIMAL(65,30) NOT NULL,
    "prompt" TEXT,
    "remarks" TEXT,
    "articleRefs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarPriceEstimate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarPriceEstimate" ADD CONSTRAINT "CarPriceEstimate_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
