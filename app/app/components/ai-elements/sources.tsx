'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';
import { BookIcon, ChevronDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

export type SourcesProps = ComponentProps<typeof Collapsible>;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible className={cn('not-prose text-primary mb-2 text-xs', className)} {...props} />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = ({ className, count, children, ...props }: SourcesTriggerProps) => (
  <CollapsibleTrigger className={cn('flex items-center gap-2', className)} {...props}>
    {children ?? (
      <>
        <p className="font-medium">Used {count} sources</p>
        <ChevronDownIcon className="h-4 w-4 shrink-0" />
      </>
    )}
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({ className, ...props }: SourcesContentProps) => (
  <CollapsibleContent
    className={cn(
      'mt-3 flex w-full min-w-0 flex-col gap-2',
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
      'data-[state=closed]:animate-out data-[state=open]:animate-in outline-none',
      className,
    )}
    {...props}
  />
);

export type SourceProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
};

export const Source = ({ className, href, title, children, ...props }: SourceProps) => {
  const content = children ?? (
    <>
      <BookIcon className="h-4 w-4 shrink-0" />
      <span className="block font-medium">{title}</span>
    </>
  );
  const combinedClassName = cn(
    'text-primary hover:text-primary/90 flex min-w-0 items-center gap-2 underline-offset-2 hover:underline',
    className,
  );
  const isExternal = /^https?:\/\//i.test(href);
  if (!isExternal && href.startsWith('/')) {
    return (
      <Link className={combinedClassName} href={href} title={title} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <a className={combinedClassName} href={href} rel="noopener noreferrer" target="_blank" title={title} {...props}>
      {content}
    </a>
  );
};
