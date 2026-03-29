-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE
    "DocumentationChunk" (
        "id" TEXT NOT NULL,
        "documentationId" TEXT NOT NULL,
        "locale" TEXT NOT NULL DEFAULT 'nl',
        "chunkIndex" INTEGER NOT NULL,
        "chunkType" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "contentHash" TEXT NOT NULL,
        "embedding" vector (1536) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "DocumentationChunk_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "ChatConversation" (
        "id" TEXT NOT NULL,
        "userId" TEXT,
        "title" TEXT NOT NULL DEFAULT '',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "ChatMessage" (
        "id" TEXT NOT NULL,
        "conversationId" TEXT NOT NULL,
        "externalId" TEXT,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "citations" JSONB NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE INDEX "DocumentationChunk_documentationId_idx" ON "DocumentationChunk" ("documentationId");

-- CreateIndex
CREATE INDEX "DocumentationChunk_locale_idx" ON "DocumentationChunk" ("locale");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationChunk_documentationId_locale_chunkIndex_key" ON "DocumentationChunk" ("documentationId", "locale", "chunkIndex");

-- CreateIndex
CREATE INDEX "ChatConversation_userId_idx" ON "ChatConversation" ("userId");

-- CreateIndex
CREATE INDEX "ChatConversation_updatedAt_idx" ON "ChatConversation" ("updatedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage" ("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_conversationId_externalId_key" ON "ChatMessage" ("conversationId", "externalId");

-- AddForeignKey
ALTER TABLE "DocumentationChunk"
ADD CONSTRAINT "DocumentationChunk_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation"
ADD CONSTRAINT "ChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE;