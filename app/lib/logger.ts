import { SeverityNumber } from '@opentelemetry/api-logs';

import { getRequestId, getRequestUserId } from '@/context/request-context';
import { isPostHogEnabled, captureException as posthogCaptureException } from '@/integrations/posthog';
import { getPostHogOtelLogger } from '@/lib/posthog-otel-logs';

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

function mapLevelToSeverity(level: 'debug' | 'info' | 'warn' | 'error'): SeverityNumber {
  switch (level) {
    case 'debug':
      return SeverityNumber.DEBUG;
    case 'info':
      return SeverityNumber.INFO;
    case 'warn':
      return SeverityNumber.WARN;
    default:
      return SeverityNumber.ERROR;
  }
}

function safeToString(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** OTLP attribute values must be primitives; stringify nested values. */
function toOtelAttributes(meta?: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  const rid = getRequestId();
  const uid = getRequestUserId();
  if (rid) out.request_id = rid;
  if (uid) out.user_id = uid;
  if (!meta) return out;
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[k] = v;
    } else {
      out[k] = safeToString(v);
    }
  }
  return out;
}

function emitPostHogOtel(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>): void {
  const otel = getPostHogOtelLogger();
  if (!otel) return;

  otel.emit({
    body: message,
    severityNumber: mapLevelToSeverity(level),
    severityText: level.toUpperCase(),
    attributes: toOtelAttributes(meta),
  });
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    emitConsole('debug', message, meta);
    emitPostHogOtel('debug', message, meta);
  },

  info(message: string, meta?: Record<string, unknown>): void {
    emitConsole('info', message, meta);
    emitPostHogOtel('info', message, meta);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    emitConsole('warn', message, meta);
    emitPostHogOtel('warn', message, meta);
  },

  error(message: string, meta?: Record<string, unknown>): void {
    emitConsole('error', message, meta);
    emitPostHogOtel('error', message, meta);
  },

  exception(reason: unknown, meta?: Record<string, unknown>): void {
    const error = toError(reason);
    const merged = { ...meta, stack: error.stack, name: error.name };
    emitConsole('error', error.message, merged);
    emitPostHogOtel('error', error.message, merged);

    if (!isPostHogEnabled) {
      return;
    }
    posthogCaptureException(error, meta);
  },
};
