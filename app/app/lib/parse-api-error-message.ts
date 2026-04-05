export async function parseApiErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  if (body && typeof body === 'object' && Array.isArray((body as { errors?: unknown[] }).errors)) {
    const firstError = (body as { errors: Array<{ message?: string }> }).errors[0];
    if (firstError?.message) {
      return firstError.message;
    }
  }
  return fallback;
}
