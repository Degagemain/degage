import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PostHogTraceExporter } from '@posthog/ai/otel';
import { NextRequest } from 'next/server';
import type { RequestErrorContext } from 'next/dist/server/instrumentation/types';

const isPostHogEnabled = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST;

export async function register() {
  if (isPostHogEnabled) {
    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        'service.name': 'open-cars',
      }),
      traceExporter: new PostHogTraceExporter({
        apiKey: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!,
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      }),
    });
    sdk.start();
  }
}

export const onRequestError = async (err: Error, request: NextRequest, context: RequestErrorContext) => {
  if (process.env.NEXT_RUNTIME === 'nodejs' && isPostHogEnabled) {
    const { getPostHogClient } = require('./app/integrations/posthog'); // eslint-disable-line @typescript-eslint/no-require-imports
    const posthog = getPostHogClient();
    let distinctId = null;
    if (request.headers.get('cookie')) {
      // Normalize multiple cookie arrays to string
      const cookie = request.headers.get('cookie');
      const cookieString = Array.isArray(cookie) ? cookie.join('; ') : cookie;
      const postHogCookieMatch = cookieString?.match(/ph_phc_.*?_posthog=([^;]+)/);
      if (postHogCookieMatch && postHogCookieMatch[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
          const postHogData = JSON.parse(decodedCookie);
          distinctId = postHogData.distinct_id;
        } catch (e) {
          console.error('Error parsing PostHog cookie:', e);
        }
      }
    }
    await posthog.captureException(err, distinctId || undefined);
  }
};
