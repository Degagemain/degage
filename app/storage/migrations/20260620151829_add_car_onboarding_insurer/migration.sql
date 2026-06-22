-- CreateEnum
CREATE TYPE "CarOnboardingInsurerStatus" AS ENUM ('notApplicable', 'todo', 'ready');

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "insurerContractStartedAt" TIMESTAMP(3),
ADD COLUMN     "insurerId" TEXT,
ADD COLUMN     "insurerStatus" "CarOnboardingInsurerStatus" NOT NULL DEFAULT 'todo';

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
