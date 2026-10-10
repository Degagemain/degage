-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN     "locale" TEXT;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "noResults" BOOLEAN;

-- CreateIndex
CREATE INDEX "ChatConversation_createdAt_idx" ON "ChatConversation"("createdAt");

-- CreateIndex
CREATE INDEX "ChatConversation_locale_idx" ON "ChatConversation"("locale");
