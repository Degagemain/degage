'use client';

import Link from 'next/link';
import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import { Streamdown } from 'streamdown';

import { rewriteRepoMarkdownLinks } from '@/app/lib/rewrite-doc-markdown-links';
import { cn } from '@/app/lib/utils';

type Props = {
  markdown: string;
  rewriteRelativeMdLinks?: boolean;
};

const streamdownPlugins = { cjk, code, math, mermaid };

export function DocumentationMarkdown({ markdown, rewriteRelativeMdLinks = true }: Props) {
  const source = rewriteRelativeMdLinks ? rewriteRepoMarkdownLinks(markdown) : markdown;

  return (
    <div
      className={cn(
        'documentation-markdown text-foreground max-w-none text-sm leading-relaxed',
        '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold',
        '[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold',
        '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-medium',
        '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse',
        '[&_th]:bg-muted/50 [&_th]:border [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left',
        '[&_td]:border [&_td]:px-2 [&_td]:py-1.5',
        '[&_.bg-sidebar]:!gap-0 [&_.bg-sidebar]:!rounded-none [&_.bg-sidebar]:!border-0 [&_.bg-sidebar]:!bg-transparent [&_.bg-sidebar]:!p-0',
      )}
    >
      <Streamdown
        plugins={streamdownPlugins}
        controls={false}
        components={{
          a: ({ href, children, ...props }) => {
            if (href?.startsWith('/')) {
              return (
                <Link href={href} className="text-primary underline underline-offset-2" {...props}>
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} className="text-primary underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </Streamdown>
    </div>
  );
}
