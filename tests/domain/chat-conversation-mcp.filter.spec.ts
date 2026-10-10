import { describe, expect, it } from 'vitest';
import { chatConversationMcpFilterSchema } from '@/domain/chat-conversation-mcp.filter';
import { DefaultTake } from '@/domain/utils';

describe('chatConversationMcpFilterSchema', () => {
  it('applies list defaults', () => {
    const parsed = chatConversationMcpFilterSchema.parse({});
    expect(parsed).toEqual({
      from: null,
      to: null,
      locale: null,
      channel: null,
      noResults: null,
      skip: 0,
      take: DefaultTake,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('covers a whole UTC day when from and to are dates', () => {
    const parsed = chatConversationMcpFilterSchema.parse({
      from: '2026-03-01',
      to: '2026-03-02',
      locale: 'nl',
      channel: 'chat',
      noResults: true,
    });
    expect(parsed.from?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    expect(parsed.to?.toISOString()).toBe('2026-03-02T23:59:59.999Z');
    expect(parsed.locale).toBe('nl');
    expect(parsed.channel).toBe('chat');
    expect(parsed.noResults).toBe(true);
  });

  it('keeps an explicit datetime', () => {
    const parsed = chatConversationMcpFilterSchema.parse({ from: '2026-03-01T08:30:00.000Z' });
    expect(parsed.from?.toISOString()).toBe('2026-03-01T08:30:00.000Z');
  });

  it('rejects an invalid date', () => {
    const parsed = chatConversationMcpFilterSchema.safeParse({ from: 'not-a-date' });
    expect(parsed.success).toBe(false);
  });

  it('treats omitted optional fields as unset', () => {
    const parsed = chatConversationMcpFilterSchema.parse({
      from: undefined,
      to: undefined,
      locale: undefined,
      channel: undefined,
      noResults: undefined,
      skip: undefined,
      take: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    });
    expect(parsed.channel).toBeNull();
    expect(parsed.noResults).toBeNull();
    expect(parsed.skip).toBe(0);
    expect(parsed.sortBy).toBe('createdAt');
  });

  it('rejects unknown fields', () => {
    const parsed = chatConversationMcpFilterSchema.safeParse({ userIds: ['user-1'] });
    expect(parsed.success).toBe(false);
  });
});
