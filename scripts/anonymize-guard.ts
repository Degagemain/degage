export const anonymizeRefusedReason = (vercelEnv: string | undefined, force: boolean): string | null => {
  if (force || vercelEnv === 'preview') {
    return null;
  }

  return 'Refusing to anonymize: VERCEL_ENV must be preview. Pass --force to run anyway.';
};
