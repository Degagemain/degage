/*
  Warnings:

  - A unique constraint covering the columns `[contractId]` on the table `CarOnboarding` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_contract';

-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN     "contractId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CarOnboarding_contractId_key" ON "CarOnboarding"("contractId");

-- AddForeignKey
ALTER TABLE "CarOnboarding" ADD CONSTRAINT "CarOnboarding_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
