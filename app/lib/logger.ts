import { getRequestId, getRequestUserId } from '@/context/request-context';
import { captureEvent, isPostHogEnabled, captureException as posthogCaptureException } from '@/integrations/posthog';

const useConsoleLogging = process.env.NODE_ENV === 'development';

export function toError(reason: unknown): Error {
  if (reason instanceof Error) return reason;
  if (typeof reason === 'string') return new Error(reason);
  try {
    return new Error(JSON.stringify(reason));
  } catch {
    return new Error(String(reason));
  }
}

function baseFields(): Record<string, string | undefined> {
  return {
    requestId: getRequestId(),
    userId: getRequestUserId(),
  };
}

function consolePayload(level: string, message: string, meta?: Record<string, unknown>): Record<string, unknown> {
  return { level, ...baseFields(), ...(meta ?? {}) };
}

function emitConsole(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>): void {
  const rid = getRequestId() ?? '—';
  const payload = consolePayload(level, message, meta);
  const line = `[${rid}] [${level}] ${message}`;
  switch (level) {
    case 'debug':
      console.debug(line, payload);
      break;
    case 'info':
      console.info(line, payload);
      break;
    case 'warn':
      console.warn(line, payload);
      break;
    default:
      console.error(line, payload);
  }
}

function emitPostHogLog(level: string, message: string, meta?: Record<string, unknown>): void {
  if (!isPostHogEnabled) return;
  captureEvent('backend_log', {
    level,
    message,
    ...baseFields(),
    ...(meta ?? {}),
  });
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (useConsoleLogging) {
      emitConsole('debug', message, meta);
      return;
    }
    emitPostHogLog('debug', message, meta);
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (useConsoleLogging) {
      emitConsole('info', message, meta);
      return;
    }
    emitPostHogLog('info', message, meta);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (useConsoleLogging) {
      emitConsole('warn', message, meta);
      return;
    }
    emitPostHogLog('warn', message, meta);
  },

  error(message: string, meta?: Record<string, unknown>): void {
    if (useConsoleLogging) {
      emitConsole('error', message, meta);
      return;
    }
    emitPostHogLog('error', message, meta);
  },

  /**
   * Report a thrown value to PostHog error tracking (prod) or stderr (dev).
   * Adds correlation fields from request context when present.
   */
  exception(reason: unknown, meta?: Record<string, unknown>): void {
    const error = toError(reason);
    if (useConsoleLogging) {
      emitConsole('error', error.message, { ...meta, stack: error.stack, name: error.name });
      return;
    }
    if (isPostHogEnabled) {
      posthogCaptureException(error, meta);
      return;
    }
    emitConsole('error', error.message, { ...meta, stack: error.stack });
  },
};
