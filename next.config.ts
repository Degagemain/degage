import { withPostHogConfig } from '@posthog/nextjs-config';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

const nextConfig: NextConfig = {};

const intlConfig = withNextIntl(nextConfig);

const posthogApiKey = process.env.POSTHOG_API_KEY;
const posthogProjectId = process.env.POSTHOG_PROJECT_ID;
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

const usePostHogSourcemaps = !!(posthogApiKey && posthogProjectId && commitSha);

const resolvedConfig = usePostHogSourcemaps
  ? withPostHogConfig(intlConfig, {
      personalApiKey: posthogApiKey,
      projectId: posthogProjectId,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      sourcemaps: {
        enabled: true,
        deleteAfterUpload: true,
        releaseVersion: commitSha ?? undefined,
      },
    })
  : intlConfig;

export default resolvedConfig;
