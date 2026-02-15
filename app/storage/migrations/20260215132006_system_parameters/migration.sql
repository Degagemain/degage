-- CreateEnum
CREATE TYPE "SystemParameterCategory" AS ENUM ('simulation');

-- CreateEnum
CREATE TYPE "SystemParameterType" AS ENUM ('number', 'number_range', 'euronorm');

-- CreateTable
CREATE TABLE "SystemParameter" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "SystemParameterCategory" NOT NULL,
    "type" "SystemParameterType" NOT NULL,
    "valueNumber" DOUBLE PRECISION,
    "valueNumberMin" DOUBLE PRECISION,
    "valueNumberMax" DOUBLE PRECISION,
    "valueEuronormId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemParameterTranslation" (
    "id" TEXT NOT NULL,
    "systemParameterId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SystemParameterTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemParameter_code_key" ON "SystemParameter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SystemParameterTranslation_systemParameterId_locale_key" ON "SystemParameterTranslation"("systemParameterId", "locale");

-- AddForeignKey
ALTER TABLE "SystemParameter" ADD CONSTRAINT "SystemParameter_valueEuronormId_fkey" FOREIGN KEY ("valueEuronormId") REFERENCES "EuroNorm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemParameterTranslation" ADD CONSTRAINT "SystemParameterTranslation_systemParameterId_fkey" FOREIGN KEY ("systemParameterId") REFERENCES "SystemParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
