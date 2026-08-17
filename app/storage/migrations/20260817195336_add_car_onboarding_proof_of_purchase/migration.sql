-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'proofOfPurchase';

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "proofOfPurchaseId" TEXT,
ADD COLUMN     "proofOfPurchasePrice" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_proofOfPurchaseId_fkey" FOREIGN KEY ("proofOfPurchaseId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
