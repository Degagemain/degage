import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { createChatConversation } from '@/actions/conversation/create';
import { searchChatConversations } from '@/actions/conversation/search';
import { safeParseRequestJson, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

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

export const POST = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const body = (data ?? {}) as { title?: string };
  const conversation = await createChatConversation({
    userId: session.user.id,
    title: body.title?.trim() || '',
  });

  return Response.json(conversation, { status: 201 });
});
