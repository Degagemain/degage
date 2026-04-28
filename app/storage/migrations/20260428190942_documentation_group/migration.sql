-- CreateTable
CREATE TABLE "DocumentationGroup" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentationGroupTranslation" (
    "id" TEXT NOT NULL,
    "documentationGroupId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DocumentationGroupTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentationToDocumentationGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentationToDocumentationGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationGroupTranslation_documentationGroupId_locale_key" ON "DocumentationGroupTranslation"("documentationGroupId", "locale");

-- CreateIndex
CREATE INDEX "_DocumentationToDocumentationGroup_B_index" ON "_DocumentationToDocumentationGroup"("B");

-- AddForeignKey
ALTER TABLE "DocumentationGroupTranslation" ADD CONSTRAINT "DocumentationGroupTranslation_documentationGroupId_fkey" FOREIGN KEY ("documentationGroupId") REFERENCES "DocumentationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentationToDocumentationGroup" ADD CONSTRAINT "_DocumentationToDocumentationGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentationToDocumentationGroup" ADD CONSTRAINT "_DocumentationToDocumentationGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "DocumentationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
