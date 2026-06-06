'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Conversation, ConversationContent } from '@/app/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/app/components/ai-elements/message';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/app/components/ai-elements/sources';
import type { ChatCitation, ChatMessage } from '@/domain/chat.model';

function AssistantSources({ citations, messageId }: { citations: ChatCitation[]; messageId: string }) {
  const t = useTranslations('admin.chatConversations.detailPage');
  if (citations.length === 0) {
    return null;
  }

  return (
    <Sources className="mt-1 w-full" defaultOpen={false}>
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
    <Conversation className="h-auto min-h-0">
      <ConversationContent className="gap-4 p-0">
        {messages.map((message) => {
          const timestamp = message.createdAt
            ? format.dateTime(new Date(message.createdAt), { dateStyle: 'medium', timeStyle: 'short' })
            : null;
          return (
            <Message key={message.id ?? message.externalId ?? message.content} from={message.role} className="max-w-full">
              <div className="flex w-full flex-col gap-1">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="font-medium">{message.role === 'user' ? t('userLabel') : t('assistantLabel')}</span>
                  {timestamp ? <span>{timestamp}</span> : null}
                </div>
                <MessageContent>
                  <MessageResponse>{message.content}</MessageResponse>
                  {message.role === 'assistant' ? (
                    <AssistantSources citations={message.citations} messageId={message.id ?? message.externalId ?? 'assistant'} />
                  ) : null}
                </MessageContent>
              </div>
            </Message>
          );
        })}
      </ConversationContent>
    </Conversation>
  );
}
