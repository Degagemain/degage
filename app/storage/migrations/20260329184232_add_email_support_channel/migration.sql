/*
  Warnings:

  - A unique constraint covering the columns `[medium,emailThreadId]` on the table `ChatConversation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conversationId,externalMessageId]` on the table `ChatMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ChatConversationMedium" AS ENUM ('frontend', 'email');

-- DropIndex
DROP INDEX "DocumentationChunk_embedding_hnsw_idx";

-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN     "emailThreadId" TEXT,
ADD COLUMN     "medium" "ChatConversationMedium" NOT NULL DEFAULT 'frontend';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "externalMessageId" TEXT;

-- CreateIndex
CREATE INDEX "ChatConversation_medium_emailThreadId_idx" ON "ChatConversation"("medium", "emailThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_medium_emailThreadId_key" ON "ChatConversation"("medium", "emailThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_conversationId_externalMessageId_key" ON "ChatMessage"("conversationId", "externalMessageId");
