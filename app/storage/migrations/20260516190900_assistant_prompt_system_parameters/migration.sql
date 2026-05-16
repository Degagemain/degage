ALTER TYPE "SystemParameterCategory" ADD VALUE 'assistant';
ALTER TYPE "SystemParameterType" ADD VALUE 'string';

ALTER TABLE "SystemParameter" ADD COLUMN "valueString" TEXT;
