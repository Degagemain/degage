import { describe, expect, it } from 'vitest';

import { parseInlineCopy } from '@/app/lib/inline-copy';

describe('parseInlineCopy', () => {
  it('returns a single text part when there are no links', () => {
    expect(parseInlineCopy('Hello world')).toEqual([{ type: 'text', value: 'Hello world' }]);
  });

  it('parses https, http, and mailto links', () => {
    expect(
      parseInlineCopy('See [the site](https://www.example.com), [http](http://example.com) or [email](mailto:hello@example.com).'),
    ).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'link', label: 'the site', href: 'https://www.example.com' },
      { type: 'text', value: ', ' },
      { type: 'link', label: 'http', href: 'http://example.com' },
      { type: 'text', value: ' or ' },
      { type: 'link', label: 'email', href: 'mailto:hello@example.com' },
      { type: 'text', value: '.' },
    ]);
  });

  it('leaves unsupported schemes as text', () => {
    expect(parseInlineCopy('Click [here](javascript:alert(1)) please')).toEqual([
      { type: 'text', value: 'Click [here](javascript:alert(1)) please' },
    ]);
  });

  it('returns an empty list for an empty string', () => {
    expect(parseInlineCopy('')).toEqual([]);
  });
});
