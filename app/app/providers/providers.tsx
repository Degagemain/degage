import { AuthProvider } from './auth-provider';
import { PostHogIdentify } from './posthog-identify';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <PostHogIdentify />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
