export const authViewPaths = {
  CALLBACK: 'callback',
  EMAIL_OTP: 'email-otp',
  FORGOT_PASSWORD: 'forgot-password',
  MAGIC_LINK: 'magic-link',
  RESET_PASSWORD: 'reset-password',
  SIGN_IN: 'sign-in',
  SIGN_UP: 'sign-up',
  CONSENT: 'consent',
} as const;

export type AuthViewPathKey = keyof typeof authViewPaths;
export type AuthViewPathSlug = (typeof authViewPaths)[AuthViewPathKey];

const phase1Paths: AuthViewPathSlug[] = [
  authViewPaths.SIGN_IN,
  authViewPaths.SIGN_UP,
  authViewPaths.FORGOT_PASSWORD,
  authViewPaths.RESET_PASSWORD,
  authViewPaths.CALLBACK,
  authViewPaths.MAGIC_LINK,
  authViewPaths.EMAIL_OTP,
  authViewPaths.CONSENT,
];

export function authStaticParams() {
  return phase1Paths.map((path) => ({ path }));
}

export function isAuthViewPath(path: string): path is AuthViewPathSlug {
  return phase1Paths.includes(path as AuthViewPathSlug);
}

export function authPath(slug: AuthViewPathSlug, search?: string) {
  return `/app/auth/${slug}${search ?? ''}`;
}
