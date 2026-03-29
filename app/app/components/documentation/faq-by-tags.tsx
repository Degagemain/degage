'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown, MessagesSquare } from 'lucide-react';

import type { Documentation } from '@/domain/documentation.model';
import type { DocumentationTag } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { cn } from '@/app/lib/utils';
import { Card, CardContent } from '@/app/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { useSupportChat } from '@/app/components/support-chat-provider';
import { Button } from '@/app/components/ui/button';

const faqCardClass = [
  'overflow-hidden border transition-shadow hover:shadow-sm',
  '[[data-state=open]_&]:shadow-sm [[data-state=open]_&]:ring-1 [[data-state=open]_&]:ring-emerald-500/20',
].join(' ');

const faqTriggerClass = [
  'focus-visible:ring-ring hover:bg-muted/40 flex w-full items-center gap-3 px-5 py-4',
  'text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
].join(' ');

const faqChevronClass = 'text-muted-foreground ml-auto size-5 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180';

export type FaqPanelClassNames = {
  panel?: string;
  headerButton?: string;
  headerRight?: string;
  title?: string;
  countBadge?: string;
  sectionChevron?: string;
  item?: string;
  itemTrigger?: string;
  questionText?: string;
  questionChevron?: string;
  itemContent?: string;
};

type Props = {
  tags: DocumentationTag[];
  className?: string;
  /** Section title (left side of the panel header). Defaults to simulationPublic.faqCollapsedTitle. */
  heading?: string;
  /** Merged with `classNames.title` for the header label. */
  headingClassName?: string;
  /** Mockup-style single panel (default) or legacy stacked cards. */
  variant?: 'panel' | 'cards';
  /** Optional class names for the panel layout (simulation theme). */
  classNames?: Partial<FaqPanelClassNames>;
  showChatFallback?: boolean;
};

function pickTranslation(doc: Documentation, locale: string) {
  const byLocale = doc.translations.find((t) => t.locale === locale);
  const byDefault = doc.translations.find((t) => t.locale === defaultContentLocale);
  return byLocale ?? byDefault ?? doc.translations[0];
}

function panelDefaults(classNames: Partial<FaqPanelClassNames> | undefined, headingClassName: string | undefined) {
  const headerButtonBase = [
    'flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-6 py-4',
    'text-left outline-none transition-colors hover:bg-muted/30',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  ].join(' ');
  const countBadgeBase = [
    'inline-flex min-h-[18px] min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-primary',
    'px-2 py-0.5 text-center text-[11px] font-semibold leading-[18px] text-primary-foreground',
  ].join(' ');
  const itemTriggerBase = [
    'flex w-full cursor-pointer items-start justify-between gap-2 border-0 bg-transparent px-6 py-4',
    'text-left outline-none transition-colors hover:bg-muted/25',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-muted/40',
  ].join(' ');

  return {
    panel: cn('overflow-hidden rounded-xl border border-border bg-card', classNames?.panel),
    headerButton: cn(headerButtonBase, classNames?.headerButton),
    headerRight: cn('flex shrink-0 items-center gap-2', classNames?.headerRight),
    title: cn('text-sm font-semibold text-foreground', classNames?.title, headingClassName),
    countBadge: cn(countBadgeBase, classNames?.countBadge),
    sectionChevron: cn(
      'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
      'group-data-[state=open]/faq-section:rotate-180',
      classNames?.sectionChevron,
    ),
    item: cn('border-t border-border', classNames?.item),
    itemTrigger: cn(itemTriggerBase, classNames?.itemTrigger),
    questionText: cn('min-w-0 flex-1 text-sm leading-snug text-foreground', classNames?.questionText),
    questionChevron: cn(
      'mt-0.5 size-3 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/faq-item:rotate-180',
      classNames?.questionChevron,
    ),
    itemContent: cn('px-6 pb-4 text-sm leading-relaxed text-muted-foreground', classNames?.itemContent),
  };
}

export function FaqByTags({ tags, className, heading, headingClassName, variant = 'panel', classNames, showChatFallback = true }: Props) {
  const uiLocale = useLocale();
  const tSim = useTranslations('simulationPublic');
  const tChat = useTranslations('chat');
  const { openChat } = useSupportChat();
  const displayHeading = heading != null && heading !== '' ? heading : tSim('faqCollapsedTitle');
  const contentLocale = useMemo(() => {
    const l = uiLocales.includes(uiLocale as UILocale) ? (uiLocale as UILocale) : undefined;
    return l ? getContentLocale(l) : defaultContentLocale;
  }, [uiLocale]);

  const tagsKey = [...tags].sort().join('|');
  const tagsRef = useRef(tags);
  tagsRef.current = tags;

  const [state, setState] = useState<{ items: Documentation[]; loading: boolean; error: string | null }>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const params = new URLSearchParams();
        params.set('isFaq', 'true');
        params.set('take', '50');
        params.set('skip', '0');
        for (const t of tagsRef.current) {
          params.append('tags', t);
        }
        const res = await fetch(`/api/documentation?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to load FAQ');
        }
        const data: Page<Documentation> = await res.json();
        if (!cancelled) {
          setState({ items: data.records, loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState({ items: [], loading: false, error: e instanceof Error ? e.message : 'Error' });
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [tagsKey]);

  if (variant === 'cards') {
    return (
      <FaqByTagsCards
        className={className}
        heading={heading}
        headingClassName={headingClassName}
        state={state}
        contentLocale={contentLocale}
        showChatFallback={showChatFallback}
      />
    );
  }

  const s = panelDefaults(classNames, headingClassName);

  if (state.loading) {
    return (
      <div className={className}>
        <div className={s.panel} aria-busy="true">
          <div className={s.headerButton}>
            <span className={s.title}>{displayHeading}</span>
            <div className={s.headerRight}>
              <Skeleton className={cn(s.countBadge, 'h-[18px] w-7 rounded-full')} />
              <Skeleton className="size-4 rounded-sm" />
            </div>
          </div>
          <div className="border-border border-t px-6 py-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={className}>
        <div className={s.panel}>
          <div className={s.headerButton}>
            <span className={s.title}>{displayHeading}</span>
            <div className={s.headerRight}>
              <span className={s.countBadge}>—</span>
              <ChevronDown className={s.sectionChevron} aria-hidden />
            </div>
          </div>
          <div className={cn(s.item, 'border-t px-6 py-4')}>
            <p className="text-muted-foreground m-0 text-sm">{state.error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    if (!showChatFallback) {
      return null;
    }
    return (
      <div className={className}>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openChat}>
          <MessagesSquare className="size-4 shrink-0" aria-hidden />
          {tChat('supportChat')}
        </Button>
      </div>
    );
  }

  const count = state.items.length;

  return (
    <div className={className}>
      <Collapsible defaultOpen={false} className={cn(s.panel, 'group/faq-section')}>
        <CollapsibleTrigger asChild>
          <button type="button" className={s.headerButton} aria-label={`${displayHeading} (${count})`}>
            <span className={s.title}>{displayHeading}</span>
            <div className={s.headerRight}>
              <span className={s.countBadge}>{count}</span>
              <ChevronDown className={s.sectionChevron} aria-hidden />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {state.items.map((doc) => {
            const tr = pickTranslation(doc, contentLocale);
            if (!tr) return null;
            const body =
              doc.format === 'markdown' ? (
                <DocumentationMarkdown markdown={tr.content} />
              ) : (
                <p className="m-0 whitespace-pre-wrap">{tr.content}</p>
              );
            return (
              <Collapsible key={doc.id ?? doc.externalId} defaultOpen={false} className={cn(s.item, 'group/faq-item')}>
                <CollapsibleTrigger asChild>
                  <button type="button" className={s.itemTrigger}>
                    <span className={s.questionText}>{tr.title}</span>
                    <ChevronDown className={s.questionChevron} aria-hidden />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className={s.itemContent}>{body}</div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {showChatFallback ? (
            <div className="border-border border-t px-6 py-4">
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openChat}>
                <MessagesSquare className="size-4 shrink-0" aria-hidden />
                {tChat('supportChat')}
              </Button>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/** Legacy card stack; kept for callers that pass variant="cards". */
function FaqByTagsCards({
  className,
  heading,
  headingClassName,
  state,
  contentLocale,
  showChatFallback = true,
}: {
  className?: string;
  heading?: string;
  headingClassName?: string;
  state: { items: Documentation[]; loading: boolean; error: string | null };
  contentLocale: string;
  showChatFallback?: boolean;
}) {
  const tChat = useTranslations('chat');
  const { openChat } = useSupportChat();
  const headingEl = heading != null && heading !== '' ? <h2 className={headingClassName}>{heading}</h2> : null;

  if (state.loading) {
    return (
      <div className={className}>
        {headingEl}
        <div className={headingEl ? 'mt-3 space-y-3' : 'space-y-3'}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    if (!headingEl) {
      return <p className="text-muted-foreground text-sm">{state.error}</p>;
    }
    return (
      <div className={className}>
        {headingEl}
        <p className="text-muted-foreground mt-3 text-sm">{state.error}</p>
      </div>
    );
  }

  if (state.items.length === 0) {
    if (!showChatFallback) {
      return null;
    }
    return (
      <div className={className}>
        {headingEl}
        <div className={headingEl ? 'mt-3' : undefined}>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openChat}>
            <MessagesSquare className="size-4 shrink-0" aria-hidden />
            {tChat('supportChat')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {headingEl}
      <div className={headingEl ? 'mt-3 space-y-3' : 'space-y-3'}>
        {state.items.map((doc, index) => {
          const tr = pickTranslation(doc, contentLocale);
          if (!tr) return null;
          const body =
            doc.format === 'markdown' ? (
              <DocumentationMarkdown markdown={tr.content} />
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{tr.content}</p>
            );
          return (
            <Collapsible key={doc.id ?? doc.externalId} defaultOpen={index === 0}>
              <Card className={faqCardClass}>
                <CollapsibleTrigger asChild>
                  <button type="button" className={faqTriggerClass}>
                    <span className="text-foreground font-medium">{tr.title}</span>
                    <ChevronDown className={faqChevronClass} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-border/50 border-t pt-4 pb-5">{body}</CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
      {showChatFallback ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openChat}>
            <MessagesSquare className="size-4 shrink-0" aria-hidden />
            {tChat('supportChat')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
