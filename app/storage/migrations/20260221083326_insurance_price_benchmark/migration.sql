-- CreateTable
CREATE TABLE "InsurancePriceBenchmark" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "maxMileageExclusive" INTEGER NOT NULL,
    "kmPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePriceBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePriceBenchmark_year_maxMileageExclusive_key" ON "InsurancePriceBenchmark"("year", "maxMileageExclusive");
