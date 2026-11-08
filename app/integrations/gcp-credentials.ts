export const parseBase64ServiceAccountJson = (credentialsB64: string): Record<string, unknown> => {
  return JSON.parse(Buffer.from(credentialsB64, 'base64').toString('utf8')) as Record<string, unknown>;
};

export const loadServiceAccountCredentialsFromEnv = (envVarName: string): Record<string, unknown> | undefined => {
  const credentialsB64 = process.env[envVarName];
  if (!credentialsB64?.trim()) {
    return undefined;
  }
  return parseBase64ServiceAccountJson(credentialsB64);
};
