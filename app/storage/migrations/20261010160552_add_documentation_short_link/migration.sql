-- AlterTable
ALTER TABLE "Documentation" ADD COLUMN     "shortLink" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Documentation_shortLink_key" ON "Documentation"("shortLink");
