-- CreateTable
CREATE TABLE "CarType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarTypeTranslation" (
    "id" TEXT NOT NULL,
    "carTypeId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CarTypeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarType_code_key" ON "CarType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CarTypeTranslation_carTypeId_locale_key" ON "CarTypeTranslation"("carTypeId", "locale");

-- AddForeignKey
ALTER TABLE "CarTypeTranslation" ADD CONSTRAINT "CarTypeTranslation_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
