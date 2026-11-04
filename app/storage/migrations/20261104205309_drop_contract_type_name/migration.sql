/*
  Warnings:

  - You are about to drop the column `name` on the `ContractType` table. All the data in the column will be lost.

*/
-- Contract.typeId is ON DELETE RESTRICT, so remove those contracts first.
-- CarOnboarding.contractId is ON DELETE SET NULL.
DELETE FROM "Contract"
WHERE "typeId" IN (
  SELECT "id" FROM "ContractType" WHERE "code" = 'other'
);

-- Remove the seeded "other" contract type. Viewers cascade.
DELETE FROM "ContractType" WHERE "code" = 'other';

-- AlterTable
ALTER TABLE "ContractType" DROP COLUMN "name";
