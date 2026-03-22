-- CreateEnum
CREATE TYPE "DocumentationSource" AS ENUM ('repository', 'notion', 'manual');

-- CreateEnum
CREATE TYPE "DocumentationFormat" AS ENUM ('markdown', 'text');

-- CreateEnum
CREATE TYPE "DocumentationAudienceRole" AS ENUM ('technical', 'admin', 'user', 'public');

-- CreateEnum
CREATE TYPE "DocumentationTag" AS ENUM ('simulation_step_1', 'simulation_step_2', 'simulation_step_3', 'simulation_step_4');

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL,
    "source" "DocumentationSource" NOT NULL,
    "externalId" TEXT NOT NULL,
    "isFaq" BOOLEAN NOT NULL DEFAULT false,
    "format" "DocumentationFormat" NOT NULL,
    "audienceRoles" "DocumentationAudienceRole"[],
    "tags" "DocumentationTag"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentationTranslation" (
    "id" TEXT NOT NULL,
    "documentationId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DocumentationTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documentation_externalId_key" ON "Documentation"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationTranslation_documentationId_locale_key" ON "DocumentationTranslation"("documentationId", "locale");

-- AddForeignKey
ALTER TABLE "DocumentationTranslation" ADD CONSTRAINT "DocumentationTranslation_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
