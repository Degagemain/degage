import { AsyncLocalStorage } from 'async_hooks';
import { nanoid } from 'nanoid';
import { type ContentLocale, defaultContentLocale, defaultUILocale } from '@/i18n/locales';

export interface RequestContext {
  locale: string;
  contentLocale: ContentLocale;
  userId?: string;
  requestId: string;
}

type RequestContextInput = Omit<RequestContext, 'requestId'> & { requestId?: string };

const requestContext = new AsyncLocalStorage<RequestContext>();

export function withRequestContext<T>(context: RequestContextInput, fn: () => T): T {
  const store: RequestContext = {
    ...context,
    requestId: context.requestId ?? nanoid(),
  };
  return requestContext.run(store, fn);
}

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.requestId;
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
