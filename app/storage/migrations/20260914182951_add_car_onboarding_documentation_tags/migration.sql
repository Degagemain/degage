-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_all';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_play_connector';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_info_session';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_user_info';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_car_info';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_insurer';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_road_assistance_plan';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_car_value';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_car_stickers';
ALTER TYPE "DocumentationTag" ADD VALUE 'car_onboarding_share_start';
