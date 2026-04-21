import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';

let loggerProvider: LoggerProvider | null = null;
let cachedLogger: ReturnType<LoggerProvider['getLogger']> | undefined;

function ensureProvider(): LoggerProvider | null {
  if (loggerProvider) return loggerProvider;
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host) return null;
  const url = `${host}/i/v1/logs`;

  loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({
      'service.name': 'open-cars',
    }),
    processors: [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ),
    ],
  });

  logs.setGlobalLoggerProvider(loggerProvider);
  return loggerProvider;
}

async function safeFlush(): Promise<void> {
  try {
    if (!ensureProvider()) return;
    await loggerProvider!.forceFlush();
  } catch {
    console.error('Error flushing PostHog OTLP logs');
  }
}

export function initPostHogOtelLogs(): void {
  ensureProvider();
}

export function getPostHogOtelLogger(): ReturnType<LoggerProvider['getLogger']> | null {
  const provider = ensureProvider();
  if (!provider) return null;
  if (!cachedLogger) {
    cachedLogger = provider.getLogger('open-cars');
  }
  return cachedLogger;
}

export async function flushPostHogOtelLogs(): Promise<void> {
  if (!hasPostHogOtelLogsProvider()) return;
  await safeFlush();
}

export function hasPostHogOtelLogsProvider(): boolean {
  return Boolean(ensureProvider());
}
