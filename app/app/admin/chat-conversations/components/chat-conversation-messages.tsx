'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { MessageResponse } from '@/app/components/ai-elements/message';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/app/components/ai-elements/sources';
import { cn } from '@/app/lib/utils';
import type { ChatCitation, ChatMessage } from '@/domain/chat.model';

function AssistantSources({ citations, messageId }: { citations: ChatCitation[]; messageId: string }) {
  const t = useTranslations('admin.chatConversations.detailPage');
  if (citations.length === 0) {
    return null;
  }

  return (
    <Sources className="mt-2 w-full" defaultOpen={false}>
      <SourcesTrigger count={citations.length}>
        <p className="text-muted-foreground font-normal">{t('articlesUsed', { count: citations.length })}</p>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
      </SourcesTrigger>
      <SourcesContent>
        {citations.map((citation, index) => (
          <Source key={`${messageId}-source-${index}`} href={citation.url} title={citation.title} />
        ))}
      </SourcesContent>
    </Sources>
  );
}

export function ChatConversationMessages({ messages }: { messages: ChatMessage[] }) {
  const t = useTranslations('admin.chatConversations.detailPage');
  const format = useFormatter();

  if (messages.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message) => {
        const timestamp = message.createdAt ? format.dateTime(new Date(message.createdAt), { dateStyle: 'medium', timeStyle: 'short' }) : null;
        const roleLabel = message.role === 'user' ? t('userLabel') : t('assistantLabel');

        const isUser = message.role === 'user';

        return (
          <div key={message.id ?? message.externalId ?? message.content} className="flex max-w-3xl flex-col items-start gap-1">
            <span className="text-muted-foreground text-xs font-medium">{roleLabel}</span>
            <div className={cn('w-fit max-w-full rounded-lg px-4 py-3 text-sm', isUser ? 'bg-secondary' : 'border-border border')}>
              <MessageResponse>{message.content}</MessageResponse>
              {!isUser ? <AssistantSources citations={message.citations} messageId={message.id ?? message.externalId ?? 'assistant'} /> : null}
            </div>
            {timestamp ? <span className="text-muted-foreground text-xs">{timestamp}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
