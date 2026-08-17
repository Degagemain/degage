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
