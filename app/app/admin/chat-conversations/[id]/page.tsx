'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import type { ChatConversationAdminDetail } from '@/domain/chat.model';
import { DashPlaceholder } from '@/domain/utils';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { ChatConversationMessages } from '../components/chat-conversation-messages';

export default function ChatConversationDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const t = useTranslations('admin.chatConversations.detailPage');
  const tList = useTranslations('admin.chatConversations');
  const format = useFormatter();

  const [conversation, setConversation] = useState<ChatConversationAdminDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversation = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chat-conversations/${id}`);
      if (!res.ok) {
        if (res.status === 404) setError(t('notFound'));
        else setError(t('loadError'));
        setConversation(null);
        return;
      }
      setConversation((await res.json()) as ChatConversationAdminDetail);
    } catch {
      setError(t('loadError'));
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="space-y-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full max-w-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/chat-conversations">{t('backToList')}</Link>
        </Button>
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-destructive font-medium">{error ?? t('notFound')}</p>
          <Button variant="outline" size="sm" onClick={fetchConversation}>
            {tList('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  const title = conversation.title.trim() || DashPlaceholder;
  const userLabel = conversation.user?.name?.trim() || tList('anonymousUser');
  const updatedAt = conversation.updatedAt
    ? format.dateTime(new Date(conversation.updatedAt), { dateStyle: 'medium', timeStyle: 'short' })
    : DashPlaceholder;

  return (
    <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/chat-conversations">{t('backToList')}</Link>
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-muted-foreground text-sm">{t('meta', { user: userLabel, updatedAt })}</p>
      </div>

      <section className="pt-2">
        <h2 className="mb-4 text-base font-semibold">{t('historyTitle')}</h2>
        <ChatConversationMessages messages={conversation.messages} />
      </section>
    </div>
  );
}
