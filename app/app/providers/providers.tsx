import { AuthProvider } from './auth-provider';
import { PosthogIdentify } from './posthog-identify';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <PosthogIdentify />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
