/** Query param for post–sign-in navigation on `/app/auth/*` pages. */
export const SIGN_IN_REDIRECT_QUERY_PARAM = 'redirectTo';

export const DEFAULT_POST_SIGN_IN_PATH = '/app/dashboard';

/**
 * Restricts post-login redirects to same-origin app routes (mitigates open redirects).
 */
export function sanitizePostSignInReturnPath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return DEFAULT_POST_SIGN_IN_PATH;
  if (!path.startsWith('/app')) return DEFAULT_POST_SIGN_IN_PATH;
  return path;
}

export function buildPostSignInReturnPath(pathname: string, queryString: string): string {
  const raw = queryString ? `${pathname}?${queryString}` : pathname;
  return sanitizePostSignInReturnPath(raw);
}

export function buildSignInUrlWithReturnPath(returnPath: string): string {
  const safe = sanitizePostSignInReturnPath(returnPath);
  return `/app/auth/sign-in?${SIGN_IN_REDIRECT_QUERY_PARAM}=${encodeURIComponent(safe)}`;
}
