-- CreateTable
CREATE TABLE "HubBenchmark" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "ownerKm" INTEGER NOT NULL,
    "sharedMinKm" INTEGER NOT NULL DEFAULT 0,
    "sharedMaxKm" INTEGER NOT NULL DEFAULT 0,
    "sharedAvgKm" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HubBenchmark_hubId_ownerKm_key" ON "HubBenchmark"("hubId", "ownerKm");

-- AddForeignKey
ALTER TABLE "HubBenchmark" ADD CONSTRAINT "HubBenchmark_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
