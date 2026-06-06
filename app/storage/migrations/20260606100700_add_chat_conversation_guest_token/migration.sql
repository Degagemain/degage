-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN     "guestToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_guestToken_key" ON "ChatConversation"("guestToken");
