/*
  Warnings:

  - The values [simulation_step_2] on the enum `DocumentationTag` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentationTag_new" AS ENUM ('simulation_step_1', 'simulation_step_2_approved', 'simulation_step_2_rejected', 'simulation_step_2_review', 'simulation_step_3', 'simulation_step_4');
ALTER TABLE "Documentation" ALTER COLUMN "tags" TYPE "DocumentationTag_new"[] USING ("tags"::text::"DocumentationTag_new"[]);
ALTER TYPE "DocumentationTag" RENAME TO "DocumentationTag_old";
ALTER TYPE "DocumentationTag_new" RENAME TO "DocumentationTag";
DROP TYPE "public"."DocumentationTag_old";
COMMIT;
