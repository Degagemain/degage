-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('registrationCertificate', 'other');

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "registrationCertificateBackId" TEXT,
ADD COLUMN     "registrationCertificateFrontId" TEXT;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "objectKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_objectKey_key" ON "Document"("objectKey");

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_registrationCertificateFrontId_fkey" FOREIGN KEY ("registrationCertificateFrontId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_registrationCertificateBackId_fkey" FOREIGN KEY ("registrationCertificateBackId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
