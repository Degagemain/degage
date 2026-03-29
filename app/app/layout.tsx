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

  return (
    <Providers>
      <SupportChatProvider>
        {!isAdminArea && !isSimulationPage && <Header />}
        {children}
      </SupportChatProvider>
      <Toaster />
    </Providers>
  );
}
