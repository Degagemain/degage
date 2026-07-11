-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'carSticker';

-- CreateTable
CREATE TABLE "CarSticker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAlwaysIncluded" BOOLEAN NOT NULL DEFAULT false,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarSticker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarSticker_name_key" ON "CarSticker"("name");

-- AddForeignKey
ALTER TABLE "CarSticker" ADD CONSTRAINT "CarSticker_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
