-- Car names are letters and digits only, at most 13 characters, so the two words are joined with no space.
-- Car adjectives are at most 5 characters and nouns at most 6, so every pair fits.

CREATE OR REPLACE FUNCTION anonymize_label(row_id text, separator text) RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  adjectives text[] := ARRAY[
    'Calm', 'Bold', 'Kind', 'Warm', 'Cool', 'Fair', 'Glad', 'Keen',
    'Soft', 'Swift', 'Quick', 'Lucky', 'Sunny', 'Brave', 'Noble', 'Quiet'
  ];
  nouns text[] := ARRAY[
    'Otter', 'Maple', 'Birch', 'Robin', 'Heron', 'Finch', 'Cedar', 'Brook',
    'Daisy', 'Comet', 'Flint', 'Coral', 'Moss', 'Pebble', 'Harbor', 'Meadow'
  ];
  digest bytea := decode(md5(row_id), 'hex');
BEGIN
  RETURN adjectives[1 + get_byte(digest, 0) % array_length(adjectives, 1)]
    || separator
    || nouns[1 + get_byte(digest, 1) % array_length(nouns, 1)];
END;
$$;

CREATE OR REPLACE FUNCTION anonymize_car_name(row_id text) RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  adjectives text[] := ARRAY[
    'Fast', 'Zippy', 'Red', 'Blue', 'Sleek', 'Mini', 'Turbo', 'Sport',
    'Rapid', 'Green', 'Gold', 'Rusty', 'Shiny', 'Loud', 'Neon', 'Wide'
  ];
  nouns text[] := ARRAY[
    'Bolt', 'Dash', 'Motor', 'Gear', 'Hatch', 'Coupe', 'Sedan', 'Wagon',
    'Piston', 'Spark', 'Chrome', 'Fender', 'Bumper', 'Axle', 'Volt', 'Rally'
  ];
  digest bytea := decode(md5(row_id), 'hex');
BEGIN
  RETURN adjectives[1 + get_byte(digest, 0) % array_length(adjectives, 1)]
    || nouns[1 + get_byte(digest, 1) % array_length(nouns, 1)];
END;
$$;

UPDATE "user"
SET
  email = 'delivered+' || lower(id) || '@resend.dev',
  name = anonymize_label(id, ' '),
  image = NULL,
  "emailVerified" = true
WHERE (SELECT dev_email FROM anonymize_config) = ''
   OR email IS DISTINCT FROM (SELECT dev_email FROM anonymize_config);

UPDATE "user"
SET "emailVerified" = true
WHERE email = (SELECT dev_email FROM anonymize_config)
  AND (SELECT dev_email FROM anonymize_config) <> '';

DELETE FROM "oauthAccessToken";

DELETE FROM "oauthRefreshToken";

DELETE FROM session;

UPDATE account
SET
  password = (SELECT password_hash FROM anonymize_config),
  "accessToken" = NULL,
  "refreshToken" = NULL,
  "idToken" = NULL,
  "accessTokenExpiresAt" = NULL,
  "refreshTokenExpiresAt" = NULL,
  scope = NULL
WHERE "providerId" = 'credential';

DELETE FROM account
WHERE "providerId" <> 'credential';

INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  "user".id,
  'credential',
  "user".id,
  (SELECT password_hash FROM anonymize_config),
  NOW(),
  NOW()
FROM "user"
WHERE NOT EXISTS (
  SELECT 1
  FROM account
  WHERE account."userId" = "user".id
    AND account."providerId" = 'credential'
);

DELETE FROM verification;

DELETE FROM jwks;

UPDATE "oauthClient"
SET
  "clientSecret" = NULL,
  contacts = '{}';

UPDATE play_connector
SET
  email = 'delivered+play-' || lower(id) || '@resend.dev',
  "encryptedPassword" = 'anonymized',
  "encryptedSessionCookie" = NULL,
  "sessionExpiresAt" = NULL,
  "credentialsInvalid" = true,
  "loginBlockedUntil" = TIMESTAMP '9999-12-31 00:00:00';

UPDATE "CarOnboarding"
SET
  "carName" = anonymize_car_name(id),
  street = NULL,
  "houseNumber" = NULL,
  phone = NULL,
  plate = NULL,
  vin = NULL,
  "carValueCounterProposalMessage" = NULL,
  "roadAssistancePlanDescription" = NULL,
  "infoSessionPcId" = NULL,
  "carPcId" = NULL;

UPDATE "Simulation"
SET email = NULL;

DROP FUNCTION anonymize_label(text, text);

DROP FUNCTION anonymize_car_name(text);
