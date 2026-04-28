'use client';

import { MessagesSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useSupportChat } from '@/app/components/support-chat-provider';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils';

export function FaqSupportFab({ className }: { className?: string }) {
  const t = useTranslations('chat');
  const { openChat } = useSupportChat();

  return (
    <div className={cn('fixed right-4 bottom-4 z-40', className)}>
      <Button type="button" onClick={openChat} className="h-12 gap-2 rounded-lg bg-[#1A3D2B] px-4 text-white shadow-lg hover:bg-[#285C40]">
        <MessagesSquare className="size-5 shrink-0" aria-hidden />
        {t('openChat')}
      </Button>
    </div>
  );
}
