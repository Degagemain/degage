-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'inspectionCertificate';

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "inspectionCertificateId" TEXT;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_inspectionCertificateId_fkey" FOREIGN KEY ("inspectionCertificateId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
