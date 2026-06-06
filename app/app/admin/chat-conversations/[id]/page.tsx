'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import type { ChatConversationAdminDetail } from '@/domain/chat.model';
import { DashPlaceholder } from '@/domain/utils';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
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

  const title = conversation?.title.trim() || DashPlaceholder;
  const userLabel = conversation?.user?.name?.trim() || tList('anonymousUser');
  const updatedAt = conversation?.updatedAt
    ? format.dateTime(new Date(conversation.updatedAt), { dateStyle: 'medium', timeStyle: 'short' })
    : DashPlaceholder;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/admin/chat-conversations">{t('backToList')}</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button onClick={fetchConversation} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {tList('tryAgain')}
          </button>
        </div>
      ) : conversation ? (
        <>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{t('meta', { user: userLabel, updatedAt })}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('historyTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatConversationMessages messages={conversation.messages} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
