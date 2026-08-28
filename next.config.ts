import { withPostHogConfig } from '@posthog/nextjs-config';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

// Real PostHog ingest origin. The browser never calls it directly; it calls the
// first-party `/ingest` path below, which these rewrites forward here. This keeps
// analytics, session recording, and exception capture out of ad blocker lists.
// The server SDKs and the source map upload host still use this origin directly.
const posthogIngestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const nextConfig: NextConfig = {
  // PostHog appends a trailing slash to some ingest requests.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    if (!posthogIngestHost) {
      return [];
    }
    const assetHost = posthogIngestHost.replace('.i.posthog.com', '-assets.i.posthog.com');
    // `/static` and `/array` must hit the asset host so remote config and the
    // lazy session-recorder script load.
    return [
      { source: '/ingest/static/:path*', destination: `${assetHost}/static/:path*` },
      { source: '/ingest/array/:path*', destination: `${assetHost}/array/:path*` },
      { source: '/ingest/:path*', destination: `${posthogIngestHost}/:path*` },
    ];
  },
};

const intlConfig = withNextIntl(nextConfig);

const posthogApiKey = process.env.POSTHOG_API_KEY;
const posthogProjectId = process.env.POSTHOG_PROJECT_ID;
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

const usePostHogSourcemaps = !!(posthogApiKey && posthogProjectId && commitSha);

const resolvedConfig = usePostHogSourcemaps
  ? withPostHogConfig(intlConfig, {
      personalApiKey: posthogApiKey,
      projectId: posthogProjectId,
      host: posthogIngestHost,
      sourcemaps: {
        enabled: true,
        deleteAfterUpload: true,
        releaseVersion: commitSha,
      },
    })
  : intlConfig;

export default resolvedConfig;
