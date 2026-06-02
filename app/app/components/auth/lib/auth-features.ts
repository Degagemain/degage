function envFlag(name: string): boolean {
  return process.env[name] === 'true';
}

export function isMagicLinkEnabled() {
  return envFlag('NEXT_PUBLIC_AUTH_MAGIC_LINK');
}

export function isEmailOtpEnabled() {
  return envFlag('NEXT_PUBLIC_AUTH_EMAIL_OTP');
}

export function getSocialProviders(): string[] {
  return process.env.NEXT_PUBLIC_BETTER_AUTH_SOCIAL_PROVIDERS?.split(',').filter(Boolean) ?? [];
}

export function isGithubAuthEnabled() {
  return getSocialProviders().includes('github');
}
