import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor, type SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PostHogSpanProcessor } from '@posthog/ai/otel';

let sdk: NodeSDK | null = null;
let spanProcessors: SpanProcessor[] = [];

function ensureSdk(): NodeSDK | null {
  if (sdk) return sdk;
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!apiKey || !host) return null;

  spanProcessors = [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${host}/i/v1/traces`,
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
    ),
    new PostHogSpanProcessor({ apiKey, host }),
  ];

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      'service.name': 'open-cars',
    }),
    spanProcessors,
  });
  sdk.start();
  return sdk;
}

async function safeFlush(): Promise<void> {
  try {
    if (!ensureSdk()) return;
    await Promise.all(spanProcessors.map((processor) => processor.forceFlush()));
  } catch {
    console.error('Error flushing PostHog OTLP traces');
  }
}

export function initPostHogOtelTraces(): void {
  ensureSdk();
}

export async function flushPostHogOtelTraces(): Promise<void> {
  if (!hasPostHogOtelTracesSdk()) return;
  await safeFlush();
}

export function hasPostHogOtelTracesSdk(): boolean {
  return Boolean(ensureSdk());
}
