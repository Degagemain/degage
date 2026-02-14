import { getRequestContentLocale } from '@/context/request-context';
import type { ContentLocale } from './locales';

/**
 * Load messages for a locale (server-side). Used to resolve simulation step messages from JSON.
 */
export async function getMessagesForLocale(locale: ContentLocale): Promise<Record<string, unknown>> {
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return messages as Record<string, unknown>;
}

/**
 * Get a nested value from an object by dot path (e.g. "simulation.step.km_under_limit").
 */
function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Interpolate {key} placeholders in a string with params.
 */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

/**
 * Get a message string by path and interpolate params. Uses request content locale.
 * Returns the path if the message is not found.
 */
export async function getMessage(path: string, params: Record<string, string | number> = {}): Promise<string> {
  const locale = getRequestContentLocale();
  const messages = await getMessagesForLocale(locale);
  const value = getNested(messages, path);
  if (typeof value !== 'string') return path;
  return interpolate(value, params);
}
