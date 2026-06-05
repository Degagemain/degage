'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

import type { ChatConversation, ChatMessage } from '@/domain/chat.model';
import { Message, MessageContent, MessageResponse } from '@/app/components/ai-elements/message';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'dd-MM-yyyy HH:mm');
}

function CitationTools({ message, t }: { message: ChatMessage; t: (key: string, values?: Record<string, number>) => string }) {
  if (message.role !== 'assistant' || message.citations.length === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="bg-background/70 mt-3 rounded-xl border px-3">
      <AccordionItem value="citations" className="border-b-0">
        <AccordionTrigger className="py-2 text-xs hover:no-underline">
          <span className="text-muted-foreground">{t('detail.toolCalls', { count: message.citations.length })}</span>
        </AccordionTrigger>
        <AccordionContent className="pb-3">
          <ul className="space-y-2">
            {message.citations.map((citation, index) => (
              <li key={`${citation.url}-${index}`} className="text-sm">
                <a href={citation.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                  {citation.title}
                </a>
                <div className="text-muted-foreground text-xs break-all">{citation.url}</div>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ChatBubble({ message, t }: { message: ChatMessage; t: (key: string, values?: Record<string, number>) => string }) {
  const isUser = message.role === 'user';

  return (
    <Message from={message.role} className={isUser ? 'max-w-[78%]' : 'max-w-[84%]'}>
      <MessageContent
        className={
          isUser
            ? [
                'group-[.is-user]:bg-primary',
                'group-[.is-user]:text-primary-foreground',
                'group-[.is-user]:rounded-2xl',
                'group-[.is-user]:px-4',
                'group-[.is-user]:py-3',
              ].join(' ')
            : 'bg-background rounded-2xl border px-4 py-3 shadow-xs'
        }
      >
        <MessageResponse>{message.content || '—'}</MessageResponse>
        <CitationTools message={message} t={t} />
      </MessageContent>
      <span className={`text-muted-foreground text-xs ${isUser ? 'text-right' : 'text-left'}`}>{formatDateTime(message.createdAt)}</span>
    </Message>
  );
}

export default function ChatConversationDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const t = useTranslations('admin.chatConversations');
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversation = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chat-conversations/${id}`);
      if (!res.ok) {
        setError(res.status === 404 ? t('detail.notFound') : t('detail.loadError'));
        setConversation(null);
        return;
      }
      const data = await res.json();
      setConversation(data as ChatConversation);
    } catch {
      setError(t('detail.loadError'));
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
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-3 py-4 md:px-4">
        <Skeleton className="h-8 w-44" />
        <div className="bg-card rounded-2xl border p-5 shadow-xs">
          <Skeleton className="mb-2 h-7 w-64" />
          <Skeleton className="mb-6 h-4 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={`h-20 ${i % 2 === 0 ? 'mr-auto w-3/4' : 'ml-auto w-2/3'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-3 py-4 md:px-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/chat-conversations">{t('detail.backToList')}</Link>
        </Button>
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchConversation}>
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  const title = conversation.title.trim() || t('emptyTitle');
  const participant = conversation.userId ?? t('anonymousUser');

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-3 py-4 md:px-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/chat-conversations">{t('detail.backToList')}</Link>
        </Button>
      </div>

      <section className="bg-card overflow-hidden rounded-2xl border shadow-xs">
        <header className="border-b px-5 py-4">
          <h1 className="truncate text-xl font-semibold">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {participant} / {formatDateTime(conversation.createdAt)}
          </p>
        </header>

        <div className="bg-muted/20 px-4 py-5 md:px-6">
          {conversation.messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('detail.noMessages')}</p>
          ) : (
            <div className="flex flex-col gap-5">
              {conversation.messages.map((message) => (
                <ChatBubble key={message.id ?? `${message.role}-${message.createdAt}`} message={message} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
