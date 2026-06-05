-- CreateTable
CREATE TABLE "TranslationOverride" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranslationOverride_locale_idx" ON "TranslationOverride"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationOverride_key_locale_key" ON "TranslationOverride"("key", "locale");
