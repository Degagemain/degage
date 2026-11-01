-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('draft', 'sent', 'signed');

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'contract';

-- CreateTable
CREATE TABLE "ContractType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultSigneeId" TEXT,
    "documensoTemplateEnvelopeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTypeViewer" (
    "id" TEXT NOT NULL,
    "contractTypeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ContractTypeViewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "ContractStatus" NOT NULL DEFAULT 'draft',
    "documentId" TEXT,
    "documensoDocumentEnvelopeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractType_code_key" ON "ContractType"("code");

-- CreateIndex
CREATE INDEX "ContractTypeViewer_userId_idx" ON "ContractTypeViewer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractTypeViewer_contractTypeId_userId_key" ON "ContractTypeViewer"("contractTypeId", "userId");

-- CreateIndex
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");

-- CreateIndex
CREATE INDEX "Contract_typeId_idx" ON "Contract"("typeId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_documensoDocumentEnvelopeId_idx" ON "Contract"("documensoDocumentEnvelopeId");

-- AddForeignKey
ALTER TABLE "ContractType" ADD CONSTRAINT "ContractType_defaultSigneeId_fkey" FOREIGN KEY ("defaultSigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTypeViewer" ADD CONSTRAINT "ContractTypeViewer_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "ContractType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTypeViewer" ADD CONSTRAINT "ContractTypeViewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ContractType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
