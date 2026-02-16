-- RenameTable
ALTER TABLE "SimulationRegion" RENAME TO "Hub";

-- RenameColumn
ALTER TABLE "Town" RENAME COLUMN "simulationRegionId" TO "hubId";
