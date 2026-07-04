export async function parseApiErrorMessage(response: Response, fallback: string, codeMessages?: Record<string, string>): Promise<string> {
  const body = await response.json().catch(() => null);
  if (body && typeof body === 'object') {
    const code = (body as { code?: string }).code;
    if (code && codeMessages?.[code]) {
      return codeMessages[code];
    }
    if (Array.isArray((body as { errors?: unknown[] }).errors)) {
      const firstError = (body as { errors: Array<{ message?: string }> }).errors[0];
      if (firstError?.message) {
        return firstError.message;
      }
    }
  }
  return fallback;
}
