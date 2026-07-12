'use client';

import { usePathname } from 'next/navigation';

import { Providers } from './providers/providers';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/header';
import { SupportChatProvider } from './components/support-chat-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith('/app/admin');
  const isSimulationPage = pathname?.startsWith('/app/simulation');
  const isCarOnboardingSection = pathname?.startsWith('/app/car-onboardings');
  const isFaqSection = pathname?.startsWith('/app/faq');
  const isLandingPage = pathname === '/app';
  const isAuthArea = pathname?.startsWith('/app/auth');
  const isAccountArea = pathname?.startsWith('/app/account');
  const isDashboardArea = pathname?.startsWith('/app/dashboard');

  return (
    <Providers>
      <SupportChatProvider>
        {!isAdminArea &&
          !isSimulationPage &&
          !isCarOnboardingSection &&
          !isFaqSection &&
          !isLandingPage &&
          !isAuthArea &&
          !isAccountArea &&
          !isDashboardArea && <Header />}
        {children}
      </SupportChatProvider>
      <Toaster />
    </Providers>
  );
}
