import { describe, expect, it } from 'vitest';
import { chatConversationMcpFilterSchema } from '@/domain/chat-conversation-mcp.filter';
import { documentationGapWhere, filterToQuery } from '@/storage/conversation/conversation.mcp-search';

const parse = (input: Record<string, unknown>) => chatConversationMcpFilterSchema.parse(input);

describe('chat conversation MCP filterToQuery', () => {
  it('returns every conversation when no filters are set', () => {
    expect(filterToQuery(parse({}))).toEqual({});
  });

  it('filters createdAt, locale, and channel', () => {
    const where = filterToQuery(parse({ from: '2026-04-01', to: '2026-04-01T12:00:00.000Z', locale: 'fr', channel: 'email' }));
    expect(where).toEqual({
      AND: [
        {
          createdAt: {
            gte: new Date('2026-04-01T00:00:00.000Z'),
            lte: new Date('2026-04-01T12:00:00.000Z'),
          },
        },
        {
          OR: [{ locale: 'fr' }, { locale: null, user: { locale: 'fr' } }],
        },
        { medium: 'email' },
      ],
    });
  });

  it('maps chat channel to the frontend medium', () => {
    expect(filterToQuery(parse({ channel: 'chat' }))).toEqual({ medium: 'frontend' });
  });

  it('selects documentation gaps, including historical empty chat citations', () => {
    expect(filterToQuery(parse({ noResults: true }))).toEqual(documentationGapWhere());
    expect(documentationGapWhere()).toEqual({
      OR: [
        { messages: { some: { role: 'assistant', noResults: true } } },
        {
          medium: 'frontend',
          messages: { some: { role: 'assistant', noResults: null, citations: { equals: [] } } },
        },
      ],
    });
  });

  it('excludes documentation gaps when noResults is false', () => {
    expect(filterToQuery(parse({ noResults: false }))).toEqual({
      AND: [{ messages: { some: { role: 'assistant' } } }, { NOT: documentationGapWhere() }],
    });
  });
});
