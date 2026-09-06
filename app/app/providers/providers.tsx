import { PostHogIdentify } from './posthog-identify';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PostHogIdentify />
      {children}
    </>
  );
}
