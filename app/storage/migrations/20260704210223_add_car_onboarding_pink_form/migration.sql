-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'pinkForm';

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "pinkFormId" TEXT;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_pinkFormId_fkey" FOREIGN KEY ("pinkFormId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
