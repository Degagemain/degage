ALTER TABLE "Hub"
ADD COLUMN "minSharedKm" INTEGER NOT NULL DEFAULT 3000,
ADD COLUMN "avgSharedKm" INTEGER NOT NULL DEFAULT 5000,
ADD COLUMN "maxSharedKm" INTEGER NOT NULL DEFAULT 7000;

ALTER TABLE "Simulation" RENAME COLUMN "resultBenchmarkMinKm" TO "resultMinSharedKm";
ALTER TABLE "Simulation" RENAME COLUMN "resultBenchmarkAvgKm" TO "resultAvgSharedKm";
ALTER TABLE "Simulation" RENAME COLUMN "resultBenchmarkMaxKm" TO "resultMaxSharedKm";

DROP TABLE "HubBenchmark";
