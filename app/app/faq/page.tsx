'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { Card, CardContent } from '@/app/components/ui/card';

const FAQ_ITEM_IDS = ['1', '3'] as const;

export default function FaqPage() {
  const t = useTranslations('faq');

  return (
    <main className="bg-muted/60 flex min-h-[calc(100dvh-4rem)] flex-col items-center py-10">
      <div className="container mx-auto w-full max-w-xl px-4">
        <header className="mb-10 text-center">
          <div className="bg-primary/5 border-primary/10 mb-5 inline-flex size-14 items-center justify-center rounded-2xl border">
            <HelpCircle className="text-primary size-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('title')}</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-base leading-relaxed">{t('intro')}</p>
        </header>

        <div className="space-y-3">
          {FAQ_ITEM_IDS.map((id) => (
            <Collapsible key={id} defaultOpen={id === '1'}>
              <Card className="overflow-hidden border transition-shadow hover:shadow-sm [[data-state=open]_&]:shadow-sm [[data-state=open]_&]:ring-1 [[data-state=open]_&]:ring-emerald-500/20">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="focus-visible:ring-ring hover:bg-muted/40 flex w-full items-center gap-3 px-5 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    <span className="text-foreground font-medium">{t(`q${id}` as 'q1')}</span>
                    <ChevronDown className="text-muted-foreground ml-auto size-5 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-border/50 border-t pt-4 pb-5">
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{t(`a${id}` as 'a1')}</p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/app/simulation">
              <ArrowLeft className="size-4" />
              {t('backToSimulation')}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
