-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "isNewCar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "purchasePrice" DECIMAL(65,30),
ADD COLUMN     "rejectionReason" TEXT;
