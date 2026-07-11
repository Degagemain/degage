-- CreateEnum
CREATE TYPE "CarOnboardingRoadAssistancePlanStatus" AS ENUM ('todo', 'ready');

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "existingRoadAssistancePlanEndDate" TIMESTAMP(3),
ADD COLUMN     "hasExistingRoadAssistancePlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roadAssistancePlanId" TEXT,
ADD COLUMN     "roadAssistancePlanStatus" "CarOnboardingRoadAssistancePlanStatus" NOT NULL DEFAULT 'todo';

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_roadAssistancePlanId_fkey" FOREIGN KEY ("roadAssistancePlanId") REFERENCES "RoadAssistancePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
