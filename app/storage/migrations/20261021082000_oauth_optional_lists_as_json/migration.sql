-- Prisma cannot store NULL in a String[] column. Better Auth writes NULL for an
-- unset resource policy, which means "inherit the default" rather than "allow nothing".
ALTER TABLE "oauthAccessToken" ALTER COLUMN "requestedUserInfoClaims" SET DATA TYPE JSONB USING CASE WHEN "requestedUserInfoClaims" IS NULL THEN NULL ELSE to_jsonb("requestedUserInfoClaims") END;
ALTER TABLE "oauthAccessToken" ALTER COLUMN "resources" SET DATA TYPE JSONB USING CASE WHEN "resources" IS NULL THEN NULL ELSE to_jsonb("resources") END;

ALTER TABLE "oauthConsent" ALTER COLUMN "requestedUserInfoClaims" SET DATA TYPE JSONB USING CASE WHEN "requestedUserInfoClaims" IS NULL THEN NULL ELSE to_jsonb("requestedUserInfoClaims") END;
ALTER TABLE "oauthConsent" ALTER COLUMN "resources" SET DATA TYPE JSONB USING CASE WHEN "resources" IS NULL THEN NULL ELSE to_jsonb("resources") END;

ALTER TABLE "oauthRefreshToken" ALTER COLUMN "requestedUserInfoClaims" SET DATA TYPE JSONB USING CASE WHEN "requestedUserInfoClaims" IS NULL THEN NULL ELSE to_jsonb("requestedUserInfoClaims") END;
ALTER TABLE "oauthRefreshToken" ALTER COLUMN "resources" SET DATA TYPE JSONB USING CASE WHEN "resources" IS NULL THEN NULL ELSE to_jsonb("resources") END;

ALTER TABLE "oauthResource" ALTER COLUMN "allowedScopes" SET DATA TYPE JSONB USING CASE WHEN "allowedScopes" IS NULL THEN NULL ELSE to_jsonb("allowedScopes") END;
