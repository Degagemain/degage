'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authClient } from '@/app/lib/auth';
import { useSupportChat } from '@/app/components/support-chat-provider';
import { LandingPage } from './components/landing/landing-page';

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { openChat } = useSupportChat();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isPending) return;
    if (session) {
      router.replace('/app/dashboard');
    }
  }, [mounted, isPending, session, router]);

  if (!mounted || isPending || session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="size-8 animate-spin rounded-full border-4 border-[#388e3c] border-t-transparent" />
      </main>
    );
  }

  return <LandingPage onOpenChat={() => openChat('landing')} />;
}
