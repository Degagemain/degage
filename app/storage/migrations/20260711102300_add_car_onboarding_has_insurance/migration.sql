-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN "hasInsuranceContract" BOOLEAN NOT NULL DEFAULT false;

-- Backfill from isPurchased: existing cars have an insurance contract, purchased cars do not
UPDATE "CarOnboarding" SET "hasInsuranceContract" = NOT "isPurchased";
