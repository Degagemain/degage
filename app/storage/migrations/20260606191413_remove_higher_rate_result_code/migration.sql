/*
  Warnings:

  - The values [higherRate] on the enum `SimulationResultCode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SimulationResultCode_new" AS ENUM ('notOk', 'categoryA', 'categoryB', 'manualReview');
ALTER TABLE "Simulation" ALTER COLUMN "resultCode" TYPE "SimulationResultCode_new" USING ("resultCode"::text::"SimulationResultCode_new");
ALTER TYPE "SimulationResultCode" RENAME TO "SimulationResultCode_old";
ALTER TYPE "SimulationResultCode_new" RENAME TO "SimulationResultCode";
DROP TYPE "public"."SimulationResultCode_old";
COMMIT;
