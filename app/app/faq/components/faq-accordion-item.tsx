'use client';

import { ChevronDown } from 'lucide-react';

import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { cn } from '@/app/lib/utils';

type Props = {
  title: string;
  markdown: string;
};

export function FaqAccordionItem({ title, markdown }: Props) {
  return (
    <Collapsible className="group/faq-item border-t border-[#DDD6CB] first:border-t-0" defaultOpen={false}>
      <CollapsibleTrigger
        className={cn(
          'hover:bg-muted/25 flex w-full items-start justify-between gap-2 border-0 bg-transparent px-5 py-4',
          'text-left text-sm font-medium text-[#181510] transition-colors',
          'outline-none focus-visible:ring-2 focus-visible:ring-[#1A3D2B] focus-visible:ring-offset-2',
          'data-[state=open]:bg-[#EAF3EC]/80',
        )}
      >
        <span className="min-w-0 flex-1 leading-snug">{title}</span>
        <ChevronDown
          className={'text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform ' + 'group-data-[state=open]/faq-item:rotate-180'}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="text-muted-foreground px-5 pt-4 pb-4 text-sm leading-relaxed data-[state=closed]:animate-none">
        <DocumentationMarkdown markdown={markdown} />
      </CollapsibleContent>
    </Collapsible>
  );
}
