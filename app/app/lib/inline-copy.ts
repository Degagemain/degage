export type InlineCopyTextPart = {
  type: 'text';
  value: string;
};

export type InlineCopyLinkPart = {
  type: 'link';
  href: string;
  label: string;
};

export type InlineCopyPart = InlineCopyTextPart | InlineCopyLinkPart;

const INLINE_COPY_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g;

export const parseInlineCopy = (text: string): InlineCopyPart[] => {
  const parts: InlineCopyPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_COPY_LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'link', label: match[1], href: match[2] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
};
