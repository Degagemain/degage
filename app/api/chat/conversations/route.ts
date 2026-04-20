import type { NextRequest } from 'next/server';
import { createChatConversation } from '@/actions/conversation/create';
import { searchChatConversations } from '@/actions/conversation/search';
import { safeParseRequestJson } from '@/api/utils';
import { withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, _context, session) => {
  const conversations = await searchChatConversations({ userId: session.user.id });
  const items = conversations.map((conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return {
      id: conversation.id,
      title: conversation.title || lastMessage?.content.slice(0, 50) || 'New conversation',
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
      messageCount: conversation.messages.length,
    };
  });

  return Response.json(items);
});

export const POST = withAuth(async (request: NextRequest, _context, session) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const body = (data ?? {}) as { title?: string };
  const conversation = await createChatConversation({
    userId: session.user.id,
    medium: 'frontend',
    title: body.title?.trim() || '',
  });

  return Response.json(conversation, { status: 201 });
});
