-- DropForeignKey
ALTER TABLE "CarOnboarding" DROP CONSTRAINT "CarOnboarding_registrationCertificateBackId_fkey";

-- DropForeignKey
ALTER TABLE "CarOnboarding" DROP CONSTRAINT "CarOnboarding_registrationCertificateFrontId_fkey";

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_registrationCertificateFrontId_fkey" FOREIGN KEY ("registrationCertificateFrontId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_registrationCertificateBackId_fkey" FOREIGN KEY ("registrationCertificateBackId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
