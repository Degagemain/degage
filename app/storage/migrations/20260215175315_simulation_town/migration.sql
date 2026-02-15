/*
  Warnings:

  - Added the required column `townId` to the `Simulation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "townId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_townId_fkey" FOREIGN KEY ("townId") REFERENCES "Town"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
