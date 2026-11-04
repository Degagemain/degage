/*
  Warnings:

  - You are about to drop the column `name` on the `ContractType` table. All the data in the column will be lost.

*/
-- Remove the seeded "other" contract type. Viewers cascade; contracts restrict deletion.
DELETE FROM "ContractType" WHERE "code" = 'other';

-- AlterTable
ALTER TABLE "ContractType" DROP COLUMN "name";
