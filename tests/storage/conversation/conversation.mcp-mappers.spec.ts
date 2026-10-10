import { describe, expect, it } from 'vitest';
import { toChatConversationMcpDetail, toChatConversationMcpListItem } from '@/storage/conversation/conversation.mappers';

const createdAt = new Date('2026-04-01T10:00:00.000Z');
const updatedAt = new Date('2026-04-02T10:00:00.000Z');

describe('chat conversation MCP mappers', () => {
  it('lists a conversation without identity fields and falls back to the user locale', () => {
    const item = toChatConversationMcpListItem({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      title: 'Battery',
      medium: 'frontend',
      locale: null,
      createdAt,
      updatedAt,
      user: { locale: 'nl' },
      messages: [{ id: 'm1', role: 'assistant', citations: [], noResults: null, createdAt }],
    });

    expect(item).toEqual({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      title: 'Battery',
      channel: 'chat',
      locale: 'nl',
      noResults: true,
      createdAt,
      updatedAt,
    });
    expect(item).not.toHaveProperty('user');
    expect(item).not.toHaveProperty('userId');
    expect(item).not.toHaveProperty('guestToken');
  });

  it('prefers the locale stored on the conversation', () => {
    const item = toChatConversationMcpListItem({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      title: '',
      medium: 'email',
      locale: 'fr',
      createdAt,
      updatedAt,
      user: { locale: 'nl' },
      messages: [{ id: 'm1', role: 'assistant', citations: [], noResults: false, createdAt }],
    });

    expect(item.channel).toBe('email');
    expect(item.locale).toBe('fr');
    expect(item.noResults).toBe(false);
  });

  it('returns messages and cited article ids, and omits citations on user messages', () => {
    const detail = toChatConversationMcpDetail({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      title: 'Help',
      medium: 'frontend',
      locale: 'en',
      createdAt,
      updatedAt,
      user: null,
      messages: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          role: 'user',
          content: 'How do I share my car?',
          citations: [{ title: 'Ignored', url: '/app/faq/articles/repo%3Aignored', externalId: 'repo:ignored' }],
          noResults: null,
          createdAt,
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          role: 'assistant',
          content: 'See the sharing article.',
          citations: [
            { title: 'Sharing', url: '/app/faq/articles/repo%3Asharing' },
            { title: 'Legacy', url: '/app/admin/documentation/repo%3Alegacy', externalId: 'repo:legacy' },
          ],
          noResults: false,
          createdAt: updatedAt,
        },
      ],
    });

    expect(detail.messages).toEqual([
      {
        id: '11111111-1111-4111-8111-111111111111',
        role: 'user',
        content: 'How do I share my car?',
        createdAt,
        citations: [],
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        role: 'assistant',
        content: 'See the sharing article.',
        createdAt: updatedAt,
        citations: [
          { externalId: 'repo:sharing', title: 'Sharing' },
          { externalId: 'repo:legacy', title: 'Legacy' },
        ],
      },
    ]);
    expect(JSON.stringify(detail)).not.toContain('guest');
    expect(detail).not.toHaveProperty('user');
  });
});
