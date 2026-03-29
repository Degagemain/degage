'use client';

import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { History, Plus, Trash2, X } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/app/components/ai-elements/conversation';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationSource,
} from '@/app/components/ai-elements/inline-citation';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/app/components/ai-elements/reasoning';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/app/components/ai-elements/prompt-input';
import { Message, MessageContent, MessageResponse } from '@/app/components/ai-elements/message';
import { chatUserMessageMaxLength } from '@/domain/chat.model';
import { cn } from '@/app/lib/utils';
import { authClient } from '@/app/lib/auth';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog';
import { Skeleton } from '@/app/components/ui/skeleton';

type ChatCitation = {
  documentationId: string;
  externalId: string;
  title: string;
  url: string;
};

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: string | null;
  createdAt: string | null;
  messageCount: number;
};

type ConversationDetail = {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    externalId: string | null;
    role: 'user' | 'assistant';
    content: string;
    citations: ChatCitation[];
    createdAt: string;
  }>;
};

const mapStoredMessagesToUi = (messages: ConversationDetail['messages']): UIMessage[] => {
  return messages.map((message) => ({
    id: message.externalId || message.id,
    role: message.role,
    parts: [{ type: 'text', text: message.content }],
    metadata: { citations: message.citations },
  }));
};

const stripBracketCitationMarkers = (text: string): string => {
  return text
    .replace(/\[\d+\]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/  +/g, ' ')
    .replace(/ \n/g, '\n')
    .trim();
};

const toolSearchStatusToLine = (
  part: UIMessage['parts'][number],
  t: (key: string, values?: Record<string, string | number>) => string,
): string | null => {
  if (part.type !== 'tool-searchDocumentation') {
    return null;
  }

  if (part.state === 'input-streaming') {
    return t('searchingDocs');
  }
  if (part.state === 'input-available') {
    const query =
      part.input && typeof part.input === 'object' && 'query' in part.input && typeof part.input.query === 'string' ? part.input.query : '';
    return t('searchingDocsFor', { query });
  }
  if (part.state === 'output-available') {
    const found =
      part.output && typeof part.output === 'object' && 'chunks' in part.output && Array.isArray(part.output.chunks)
        ? part.output.chunks.length
        : 0;
    return t('docsFound', { count: found });
  }
  if (part.state === 'output-error') {
    return t('docsSearchError');
  }
  return null;
};

export type SupportChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SupportChatDialog({ open, onOpenChange }: SupportChatDialogProps) {
  const t = useTranslations('chat');
  const format = useFormatter();
  const { data: session, isPending } = authClient.useSession();
  const [input, setInput] = useState('');
  const [conversationList, setConversationList] = useState<ConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastLoadedConversationId, setLastLoadedConversationId] = useState<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!open || isPending || isHistoryOpen || isLoadingMessages) {
      return;
    }
    let cancelled = false;
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const el = promptTextareaRef.current;
        if (el && !el.disabled) {
          el.focus({ preventScroll: true });
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(outer);
    };
  }, [open, isPending, session?.user, isHistoryOpen, isLoadingMessages]);

  const loadConversationList = useCallback(async () => {
    if (!session?.user) {
      setConversationList([]);
      setActiveConversationId(null);
      setIsLoadingConversations(false);
      return;
    }
    setIsLoadingConversations(true);
    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }
      const rows: ConversationListItem[] = await response.json();
      setConversationList(rows);
      setActiveConversationId((current) => {
        if (current) return current;
        return rows.length > 0 ? rows[0]!.id : null;
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [session?.user]);

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          conversationId: activeConversationIdRef.current ?? undefined,
          messages,
        },
      }),
    }),
    onFinish: async ({ message }) => {
      const metadata = (message as UIMessage).metadata as { citations?: ChatCitation[]; conversationId?: string } | undefined;
      const conversationId = activeConversationIdRef.current ?? metadata?.conversationId ?? null;
      if (!conversationId) return;
      if (activeConversationIdRef.current !== conversationId) {
        setActiveConversationId(conversationId);
        setLastLoadedConversationId(conversationId);
      }
      if (session?.user) {
        await loadConversationList();
      }
    },
  });

  useEffect(() => {
    if (session?.user) {
      return;
    }
    setConversationList([]);
    setActiveConversationId(null);
    setLastLoadedConversationId(null);
    setIsHistoryOpen(false);
    setMessages([]);
  }, [session?.user, setMessages]);

  const createConversation = useCallback(async () => {
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    const conversation: ConversationDetail = await response.json();
    setActiveConversationId(conversation.id);
    setMessages([]);
    setIsHistoryOpen(false);
    await loadConversationList();
  }, [loadConversationList, session?.user, setMessages]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      setActiveConversationId(conversationId);
      try {
        const response = await fetch(`/api/chat/conversations/${conversationId}`);
        if (!response.ok) {
          throw new Error('Failed to load conversation');
        }
        const conversation: ConversationDetail = await response.json();
        setMessages(mapStoredMessagesToUi(conversation.messages));
        setLastLoadedConversationId(conversationId);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [setMessages],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, { method: 'DELETE' });
      if (!response.ok) return;
      const nextList = conversationList.filter((item) => item.id !== conversationId);
      setConversationList(nextList);
      if (activeConversationId === conversationId) {
        if (nextList.length > 0) {
          setActiveConversationId(nextList[0]!.id);
          setLastLoadedConversationId(null);
        } else {
          setActiveConversationId(null);
          setLastLoadedConversationId(null);
          setMessages([]);
        }
      }
    },
    [activeConversationId, conversationList, setMessages],
  );

  useEffect(() => {
    if (!open || !session?.user) return;
    void loadConversationList();
  }, [open, session?.user, loadConversationList]);

  useEffect(() => {
    if (!open || !activeConversationId) return;
    if (isLoadingMessages) return;
    if (activeConversationId === lastLoadedConversationId) return;
    void loadConversation(activeConversationId);
  }, [open, activeConversationId, isLoadingMessages, lastLoadedConversationId, loadConversation]);

  const activeConversationLabel = useMemo(() => {
    return conversationList.find((item) => item.id === activeConversationId)?.title || t('newConversation');
  }, [activeConversationId, conversationList, t]);

  const dialogAccessibilityTitle = useMemo(() => {
    if (isPending || !session?.user) return t('openChatCardTitle');
    if (isHistoryOpen) return t('conversations');
    return activeConversationLabel;
  }, [isPending, session?.user, isHistoryOpen, activeConversationLabel, t]);

  const handlePromptSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (status !== 'ready') return;
      const text = message.text.trim().slice(0, chatUserMessageMaxLength);
      if (!text) return;
      sendMessage({ text });
      setInput('');
    },
    [sendMessage, status],
  );

  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        withOverlay={false}
        className={[
          'fixed top-auto right-4 bottom-4 left-auto z-50 flex h-[min(88vh,720px)] max-h-[min(88vh,720px)]',
          'w-[min(100vw-2rem,520px)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border p-0 shadow-lg',
          'sm:max-w-none',
        ].join(' ')}
      >
        <DialogTitle className="sr-only">{dialogAccessibilityTitle}</DialogTitle>
        {isPending ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Card className="flex min-h-0 flex-1 flex-col border-0 shadow-none">
            <CardHeader className="shrink-0 pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="truncate pr-2 text-sm">{isHistoryOpen ? t('conversations') : activeConversationLabel}</CardTitle>
                <div className="flex items-center gap-1">
                  {session?.user ? (
                    <>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t('newConversation')}
                        onClick={() => void createConversation()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={isHistoryOpen ? 'secondary' : 'ghost'}
                        aria-label={t('conversations')}
                        onClick={() => setIsHistoryOpen((value) => !value)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </>
                  ) : null}
                  <Button type="button" size="icon" variant="ghost" aria-label={t('closeChat')} onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative flex min-h-0 flex-1 flex-col gap-2 px-6 pb-2">
              {isHistoryOpen && session?.user ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="text-muted-foreground min-h-0 flex-1 space-y-3 overflow-y-auto py-1">
                    {isLoadingConversations ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      conversationList.map((item) => {
                        const created = item.createdAt ? new Date(item.createdAt) : null;
                        const createdValid = created !== null && !Number.isNaN(created.getTime());
                        const createdLabel = createdValid ? format.dateTime(created, { dateStyle: 'medium', timeStyle: 'short' }) : null;

                        return (
                          <div key={item.id} className="group flex items-start gap-1 rounded px-1 py-0.5">
                            <button
                              type="button"
                              className={cn(
                                'flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left text-sm transition-colors',
                                item.id === activeConversationId
                                  ? 'text-foreground font-medium'
                                  : 'text-muted-foreground hover:text-foreground/80',
                              )}
                              onClick={() => {
                                setActiveConversationId(item.id);
                                setLastLoadedConversationId(null);
                                setIsHistoryOpen(false);
                              }}
                            >
                              <span className="w-full truncate">{item.title || t('newConversation')}</span>
                              {createdLabel && item.createdAt ? (
                                <time className="text-muted-foreground/80 w-full text-xs font-normal tabular-nums" dateTime={item.createdAt}>
                                  {t('conversationCreatedLabel', { time: createdLabel })}
                                </time>
                              ) : null}
                            </button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'text-muted-foreground hover:text-foreground size-8 shrink-0 opacity-0 transition-opacity duration-150',
                                'group-focus-within:opacity-100 group-hover:opacity-100',
                              )}
                              onClick={() => void deleteConversation(item.id)}
                              aria-label={t('deleteConversation')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : isLoadingMessages ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <Conversation className="min-h-0 flex-1">
                  <ConversationContent className="gap-4">
                    {messages.length === 0 && status === 'ready' ? (
                      <ConversationEmptyState
                        className="min-h-[12rem] flex-1 justify-center py-6"
                        description={t('emptyConversationDescription')}
                        title={t('emptyConversationTitle')}
                      />
                    ) : null}
                    {messages.map((message, messageIndex) => {
                      const citations =
                        (((message.metadata as { citations?: ChatCitation[] } | undefined)?.citations ?? []) as ChatCitation[]) || [];
                      const hasTextPart = message.parts.some((part) => part.type === 'text' && part.text.trim().length > 0);
                      const isLastMessage = messageIndex === messages.length - 1;
                      const reasoningFromModel = message.parts
                        .filter((part) => part.type === 'reasoning')
                        .map((part) => part.text)
                        .join('\n\n');
                      const toolStatusLines = message.parts
                        .map((part) => toolSearchStatusToLine(part, t))
                        .filter((line): line is string => Boolean(line));
                      const reasoningText = [reasoningFromModel, ...toolStatusLines].filter(Boolean).join('\n');
                      const lastPart = message.parts.at(-1);
                      const isReasoningStreaming =
                        isLastMessage &&
                        (status === 'streaming' || status === 'submitted') &&
                        (lastPart?.type === 'reasoning' || lastPart?.type === 'tool-searchDocumentation');
                      return (
                        <Message key={message.id} from={message.role}>
                          <MessageContent>
                            {reasoningText && message.role === 'assistant' && (
                              <Reasoning className="w-full" isStreaming={isReasoningStreaming}>
                                <ReasoningTrigger
                                  getThinkingMessage={(isStreaming) => {
                                    if (toolStatusLines.length > 0) {
                                      if (isStreaming) {
                                        return t('searchingDocs');
                                      }
                                      return toolStatusLines[toolStatusLines.length - 1] ?? t('searchingDocs');
                                    }
                                    return isStreaming ? t('assistantWorking') : t('assistant');
                                  }}
                                />
                                <ReasoningContent>{reasoningText}</ReasoningContent>
                              </Reasoning>
                            )}
                            {message.parts.map((part, idx) => {
                              if (part.type === 'text') {
                                return <MessageResponse key={`${message.id}-${idx}`}>{stripBracketCitationMarkers(part.text)}</MessageResponse>;
                              }
                              if (part.type === 'tool-searchDocumentation' || part.type === 'reasoning') return null;

                              return null;
                            })}
                            {!hasTextPart && message.role === 'assistant' && (
                              <p className="text-muted-foreground text-sm italic">{t('assistantWorking')}</p>
                            )}
                            {citations.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {citations.map((citation) => (
                                  <InlineCitation key={`${message.id}-citation-${citation.documentationId}`}>
                                    <InlineCitationCard>
                                      <InlineCitationCardTrigger label={citation.title} sources={[citation.url]} />
                                      <InlineCitationCardBody>
                                        <InlineCitationCarousel>
                                          <InlineCitationCarouselHeader>
                                            <InlineCitationCarouselPrev />
                                            <InlineCitationCarouselNext />
                                            <InlineCitationCarouselIndex />
                                          </InlineCitationCarouselHeader>
                                          <InlineCitationCarouselContent>
                                            <InlineCitationCarouselItem>
                                              <InlineCitationSource title={citation.title}>
                                                {/^https?:\/\//i.test(citation.url) ? (
                                                  <a
                                                    href={citation.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary text-sm font-medium underline underline-offset-2 hover:no-underline"
                                                  >
                                                    {t('openDocumentation')}
                                                  </a>
                                                ) : (
                                                  <Link
                                                    href={citation.url}
                                                    className="text-primary text-sm font-medium underline underline-offset-2 hover:no-underline"
                                                  >
                                                    {t('openDocumentation')}
                                                  </Link>
                                                )}
                                              </InlineCitationSource>
                                            </InlineCitationCarouselItem>
                                          </InlineCitationCarouselContent>
                                        </InlineCitationCarousel>
                                      </InlineCitationCardBody>
                                    </InlineCitationCard>
                                  </InlineCitation>
                                ))}
                              </div>
                            )}
                          </MessageContent>
                        </Message>
                      );
                    })}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
              )}

              {(!isHistoryOpen || !session?.user) && (
                <PromptInput className="mt-auto" onSubmit={handlePromptSubmit}>
                  <PromptInputBody>
                    <PromptInputTextarea
                      ref={promptTextareaRef}
                      maxLength={chatUserMessageMaxLength}
                      onChange={(event) => setInput(event.target.value.slice(0, chatUserMessageMaxLength))}
                      placeholder={t('inputPlaceholder')}
                      value={input}
                    />
                  </PromptInputBody>
                  <PromptInputFooter className="pb-1.5">
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums" aria-live="polite">
                      {t('inputCharacterCount', { current: input.length, max: chatUserMessageMaxLength })}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                      <PromptInputTools />
                      <PromptInputSubmit disabled={status === 'ready' ? !input.trim() : false} onStop={stop} status={status} />
                    </div>
                  </PromptInputFooter>
                </PromptInput>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
