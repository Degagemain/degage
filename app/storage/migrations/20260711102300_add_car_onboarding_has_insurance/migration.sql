-- AlterTable
ALTER TABLE "CarOnboarding" ADD COLUMN "hasInsurance" BOOLEAN NOT NULL DEFAULT false;

-- Backfill from isPurchased: existing cars have insurance, purchased cars do not
UPDATE "CarOnboarding" SET "hasInsurance" = NOT "isPurchased";
