-- CreateEnum
CREATE TYPE "CarOnboardingInfoSessionStatus" AS ENUM ('todo', 'enrolled', 'done');

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "infoSessionDate" TIMESTAMP(3),
ADD COLUMN     "infoSessionPcId" TEXT,
ADD COLUMN     "infoSessionStatus" "CarOnboardingInfoSessionStatus" NOT NULL DEFAULT 'todo';
