import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatConversationSortColumns } from '@/domain/conversation.filter';
import { SortOrder } from '@/domain/utils';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

vi.mock('@/storage/conversation/conversation.mappers', () => ({
  dbChatConversationListItemToDomain: vi.fn(),
}));

import { adminConversationFilterToQuery, dbAdminChatConversationSearch } from '@/storage/conversation/admin-conversation.search';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationListItemToDomain } from '@/storage/conversation/conversation.mappers';

const filter = {
  query: null,
  userIds: [],
  skip: 0,
  take: 20,
  sortBy: ChatConversationSortColumns.UPDATED_AT,
  sortOrder: SortOrder.DESC,
};

describe('adminConversationFilterToQuery', () => {
  it('returns an empty where clause without filters', () => {
    expect(adminConversationFilterToQuery(filter)).toEqual({});
  });

  it('searches title and user fields', () => {
    expect(adminConversationFilterToQuery({ ...filter, query: ' billing ' })).toEqual({
      OR: [
        { title: { contains: 'billing', mode: 'insensitive' } },
        { user: { name: { contains: 'billing', mode: 'insensitive' } } },
        { user: { email: { contains: 'billing', mode: 'insensitive' } } },
      ],
    });
  });

  it('filters by selected users', () => {
    expect(adminConversationFilterToQuery({ ...filter, userIds: ['user-1', 'user-2'] })).toEqual({
      userId: { in: ['user-1', 'user-2'] },
    });
  });
});

describe('dbAdminChatConversationSearch', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads paginated list rows without loading messages', async () => {
    const dbRow = {
      id: 'thread-1',
      title: 'Pricing question',
      user: { id: 'user-1', name: 'Jane Doe', email: 'jane@example.com' },
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
    };
    const domainRow = {
      id: 'thread-1',
      title: 'Pricing question',
      user: { id: 'user-1', name: 'Jane Doe', email: 'jane@example.com' },
      createdAt: dbRow.createdAt,
      updatedAt: dbRow.updatedAt,
    };
    const mockPrisma = {
      chatConversation: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([dbRow]),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbChatConversationListItemToDomain).mockReturnValue(domainRow);

    const result = await dbAdminChatConversationSearch({
      ...filter,
      userIds: ['user-1'],
      skip: 20,
      take: 10,
      sortBy: ChatConversationSortColumns.TITLE,
      sortOrder: SortOrder.ASC,
    });

    expect(mockPrisma.chatConversation.count).toHaveBeenCalledWith({ where: { userId: { in: ['user-1'] } } });
    expect(mockPrisma.chatConversation.findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['user-1'] } },
      include: { user: true },
      skip: 20,
      take: 10,
      orderBy: { title: 'asc' },
    });
    expect(result).toEqual({ records: [domainRow], total: 1 });
  });
});
