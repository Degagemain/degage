/*
  Warnings:

  - The values [notion] on the enum `DocumentationSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- Delete Notion-sourced documentation (translations, chunks, and group links cascade) before dropping the enum value.
DELETE FROM "Documentation" WHERE "source" = 'notion';

-- AlterEnum
BEGIN;
CREATE TYPE "DocumentationSource_new" AS ENUM ('repository', 'manual');
ALTER TABLE "Documentation" ALTER COLUMN "source" TYPE "DocumentationSource_new" USING ("source"::text::"DocumentationSource_new");
ALTER TYPE "DocumentationSource" RENAME TO "DocumentationSource_old";
ALTER TYPE "DocumentationSource_new" RENAME TO "DocumentationSource";
DROP TYPE "public"."DocumentationSource_old";
COMMIT;
