'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

import type { ChatConversation, ChatMessage } from '@/domain/chat.model';
import { Message, MessageContent, MessageResponse } from '@/app/components/ai-elements/message';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
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
    <Accordion type="single" collapsible className="bg-muted/40 mt-3 rounded-md border px-3">
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
    <Message from={message.role} className={isUser ? 'max-w-[80%]' : 'max-w-[86%]'}>
      <div className={isUser ? 'text-right' : 'text-left'}>
        <Badge variant={isUser ? 'secondary' : 'outline'} className="mb-1 font-normal">
          {isUser ? t('detail.userMessage') : t('detail.assistantMessage')}
        </Badge>
      </div>
      <MessageContent className={isUser ? undefined : 'bg-background rounded-lg border px-4 py-3 shadow-xs'}>
        <MessageResponse>{message.content || '—'}</MessageResponse>
        <CitationTools message={message} t={t} />
      </MessageContent>
      <span className={`text-muted-foreground text-xs ${isUser ? 'text-right' : 'text-left'}`}>{formatDateTime(message.createdAt)}</span>
    </Message>
  );
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2 text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span>{value ?? '—'}</span>
    </div>
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
      <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
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

  return (
    <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/chat-conversations">{t('detail.backToList')}</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{t('detail.description')}</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <FieldRow label={t('columns.user')} value={conversation.userId ?? t('anonymousUser')} />
            <FieldRow label={t('detail.medium')} value={conversation.medium} />
            <FieldRow label={t('detail.emailThreadId')} value={conversation.emailThreadId} />
            <FieldRow label={t('columns.created')} value={formatDateTime(conversation.createdAt)} />
            <FieldRow label={t('columns.updated')} value={formatDateTime(conversation.updatedAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('detail.historyTitle')}</CardTitle>
            <CardDescription>{t('detail.historyDescription', { count: conversation.messages.length })}</CardDescription>
          </CardHeader>
          <CardContent>
            {conversation.messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('detail.noMessages')}</p>
            ) : (
              <div className="flex flex-col gap-5">
                {conversation.messages.map((message) => (
                  <ChatBubble key={message.id ?? `${message.role}-${message.createdAt}`} message={message} t={t} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
