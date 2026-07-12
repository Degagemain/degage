-- CreateTable
CREATE TABLE "CarOnboardingSticker" (
    "carOnboardingId" TEXT NOT NULL,
    "carStickerId" TEXT NOT NULL,

    CONSTRAINT "CarOnboardingSticker_pkey" PRIMARY KEY ("carOnboardingId","carStickerId")
);

-- AddForeignKey
ALTER TABLE "CarOnboardingSticker" ADD CONSTRAINT "CarOnboardingSticker_carOnboardingId_fkey" FOREIGN KEY ("carOnboardingId") REFERENCES "CarOnboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOnboardingSticker" ADD CONSTRAINT "CarOnboardingSticker_carStickerId_fkey" FOREIGN KEY ("carStickerId") REFERENCES "CarSticker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
