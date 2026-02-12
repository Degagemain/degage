-- CreateTable
CREATE TABLE "CarBrand" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarBrandTranslation" (
    "id" TEXT NOT NULL,
    "carBrandId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CarBrandTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarBrand_code_key" ON "CarBrand"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CarBrandTranslation_carBrandId_locale_key" ON "CarBrandTranslation"("carBrandId", "locale");

-- AddForeignKey
ALTER TABLE "CarBrandTranslation" ADD CONSTRAINT "CarBrandTranslation_carBrandId_fkey" FOREIGN KEY ("carBrandId") REFERENCES "CarBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
