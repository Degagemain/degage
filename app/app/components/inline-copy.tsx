import { Fragment, type ReactNode } from 'react';

import { parseInlineCopy } from '@/app/lib/inline-copy';

type InlineCopyProps = {
  children: string;
};

export function InlineCopy({ children }: InlineCopyProps) {
  return (
    <>
      {parseInlineCopy(children).map((part, index) => {
        if (part.type === 'text') {
          return part.value;
        }

        const isMailto = part.href.startsWith('mailto:');

        return (
          <a
            key={`${part.href}-${index}`}
            href={part.href}
            className="underline underline-offset-2"
            {...(isMailto ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {part.label}
          </a>
        );
      })}
    </>
  );
}

export function renderInlineCopyRich(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    return <InlineCopy>{node}</InlineCopy>;
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => <Fragment key={index}>{renderInlineCopyRich(child)}</Fragment>);
  }

  return node;
}
