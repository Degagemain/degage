-- CreateTable
CREATE TABLE "RoadAssistancePlan" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadAssistancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadAssistancePlanTranslation" (
    "id" TEXT NOT NULL,
    "roadAssistancePlanId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "RoadAssistancePlanTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoadAssistancePlanTranslation_roadAssistancePlanId_locale_key" ON "RoadAssistancePlanTranslation"("roadAssistancePlanId", "locale");

-- AddForeignKey
ALTER TABLE "RoadAssistancePlanTranslation" ADD CONSTRAINT "RoadAssistancePlanTranslation_roadAssistancePlanId_fkey" FOREIGN KEY ("roadAssistancePlanId") REFERENCES "RoadAssistancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
