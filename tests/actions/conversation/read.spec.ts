import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/conversation/conversation.read', () => ({
  dbChatConversationRead: vi.fn(),
}));

import { readChatConversation } from '@/actions/conversation/read';
import { dbChatConversationRead } from '@/storage/conversation/conversation.read';

const conversation = (overrides: Partial<Awaited<ReturnType<typeof readChatConversation>>> = {}) => ({
  id: '0c5bd3fa-876e-4b4f-a72f-3366a716874c',
  userId: 'viewer-1',
  medium: 'frontend',
  emailThreadId: null,
  title: 'test',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('readChatConversation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when conversation does not exist', async () => {
    vi.mocked(dbChatConversationRead).mockResolvedValueOnce(null);
    const result = await readChatConversation('id', { id: 'viewer-1', role: 'user' });
    expect(result).toBeNull();
  });

  it('allows admins to read any conversation', async () => {
    vi.mocked(dbChatConversationRead).mockResolvedValueOnce(conversation({ userId: null }) as any);
    const result = await readChatConversation('id', { id: 'admin-1', role: 'admin' });
    expect(result?.id).toBe('0c5bd3fa-876e-4b4f-a72f-3366a716874c');
  });

  it('denies unauthenticated viewers', async () => {
    vi.mocked(dbChatConversationRead).mockResolvedValueOnce(conversation() as any);
    const result = await readChatConversation('id', null);
    expect(result).toBeNull();
  });

  it('denies non-admin viewer when conversation has no owner', async () => {
    vi.mocked(dbChatConversationRead).mockResolvedValueOnce(conversation({ userId: null }) as any);
    const result = await readChatConversation('id', { id: 'viewer-1', role: 'user' });
    expect(result).toBeNull();
  });

  it('denies non-owner viewer', async () => {
    vi.mocked(dbChatConversationRead).mockResolvedValueOnce(conversation({ userId: 'viewer-2' }) as any);
    const result = await readChatConversation('id', { id: 'viewer-1', role: 'user' });
    expect(result).toBeNull();
  });

  it('allows owner viewer', async () => {
    vi.mocked(dbChatConversationRead).mockResolvedValueOnce(conversation({ userId: 'viewer-1' }) as any);
    const result = await readChatConversation('id', { id: 'viewer-1', role: 'user' });
    expect(result?.id).toBe('0c5bd3fa-876e-4b4f-a72f-3366a716874c');
  });
});
