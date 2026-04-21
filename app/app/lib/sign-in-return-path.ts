/**
 * Query param read by @daveyplate/better-auth-ui for post–sign-in navigation.
 * @see node_modules/@daveyplate/better-auth-ui/dist/index.js (getSearchParam("redirectTo"))
 */
export const SIGN_IN_REDIRECT_QUERY_PARAM = 'redirectTo';

const DEFAULT_RETURN_PATH = '/app';

/**
 * Restricts post-login redirects to same-origin app routes (mitigates open redirects).
 */
export function sanitizePostSignInReturnPath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return DEFAULT_RETURN_PATH;
  if (!path.startsWith('/app')) return DEFAULT_RETURN_PATH;
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
