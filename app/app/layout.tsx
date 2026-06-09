'use client';

import { usePathname } from 'next/navigation';

import { Providers } from './providers/providers';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/header';
import { SupportChatProvider } from './components/support-chat-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith('/app/admin');
  const isSimulationPage = pathname === '/app/simulation';
  const isFaqSection = pathname?.startsWith('/app/faq');
  const isLandingPage = pathname === '/app';
  const isAuthArea = pathname?.startsWith('/app/auth');
  const isAccountArea = pathname?.startsWith('/app/account');
  const isDashboardArea = pathname?.startsWith('/app/dashboard');
  const isDemoArea = pathname?.startsWith('/app/demo');

  return (
    <Providers>
      <SupportChatProvider>
        {!isAdminArea &&
          !isSimulationPage &&
          !isFaqSection &&
          !isLandingPage &&
          !isAuthArea &&
          !isAccountArea &&
          !isDashboardArea &&
          !isDemoArea && <Header />}
        {children}
      </SupportChatProvider>
      <Toaster />
    </Providers>
  );
}
