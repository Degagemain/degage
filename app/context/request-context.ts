import { AsyncLocalStorage } from 'async_hooks';
import { type ContentLocale, defaultContentLocale, defaultUILocale } from '@/i18n/locales';

interface RequestContext {
  locale: string;
  contentLocale: ContentLocale;
  userId?: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

export function withRequestContext<T>(context: RequestContext, fn: () => T): T {
  return requestContext.run(context, fn);
}

export function getRequestContentLocale(): ContentLocale {
  return requestContext.getStore()?.contentLocale ?? defaultContentLocale;
}

export function getRequestLocale(): string {
  return requestContext.getStore()?.locale ?? defaultUILocale;
}

export function getRequestUserId(): string | undefined {
  return requestContext.getStore()?.userId;
}
