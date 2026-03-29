import { createChatConversation } from '@/actions/conversation/create';
import { createMessage } from '@/actions/conversation/message/create';
import { readChatConversationByMediumAndThread } from '@/actions/conversation/read-by-medium-thread';
import { generateSupportReplyText } from '@/actions/support/generate-reply';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { getResendClient, sendEmail } from '@/integrations/resend';

type ResendReceivedEvent = {
  type?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    message_id?: string;
  };
};

type ParsedInboundEmail = {
  text: string;
  headers: Record<string, string>;
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const toErrorMessage = (value: unknown): string => {
  if (!value) return 'unknown_error';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
    return value.message;
  }
  return String(value);
};

const isUniqueConstraintError = (error: unknown): boolean => {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'P2002');
};

const normalizeAddress = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/<([^>]+)>/);
  return (match?.[1] ?? trimmed).trim();
};

const parseSenderEmail = (fromHeader: string): string | null => {
  if (!fromHeader.trim()) return null;
  const normalized = normalizeAddress(fromHeader);
  return normalized.includes('@') ? normalized : null;
};

const stripHtml = (html: string): string => {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const normalizeHeaderValue = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ');
  if (value === null || value === undefined) return null;
  return String(value);
};

const toHeaderMap = (rawHeaders: unknown): Record<string, string> => {
  const entries: Array<[string, string]> = [];

  if (Array.isArray(rawHeaders)) {
    for (const item of rawHeaders) {
      if (!item || typeof item !== 'object') continue;
      const name = 'name' in item ? normalizeHeaderValue((item as { name?: unknown }).name) : null;
      const value = 'value' in item ? normalizeHeaderValue((item as { value?: unknown }).value) : null;
      if (!name || !value) continue;
      entries.push([name.toLowerCase(), value]);
    }
  } else if (rawHeaders && typeof rawHeaders === 'object') {
    for (const [key, value] of Object.entries(rawHeaders)) {
      const normalized = normalizeHeaderValue(value);
      if (!normalized) continue;
      entries.push([key.toLowerCase(), normalized]);
    }
  }

  return Object.fromEntries(entries);
};

const getReceivedBodyAndHeaders = async (emailId: string): Promise<ParsedInboundEmail | null> => {
  const resend = getResendClient();
  if (!resend) {
    console.error('[support email] RESEND_API_KEY missing; cannot fetch received email content');
    return null;
  }

  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = (await resend.emails.receiving.get(emailId)) as {
        data?: unknown;
        error?: unknown;
      };

      if (response.error) {
        console.warn('[support email] failed to fetch received email from Resend API', {
          emailId,
          attempt,
          error: toErrorMessage(response.error),
        });
        if (attempt < maxAttempts) {
          await delay(300);
          continue;
        }
        return null;
      }

      const payload = response.data;
      if (!payload || typeof payload !== 'object') {
        console.warn('[support email] received email payload is empty', {
          emailId,
          attempt,
          hasData: Boolean(payload),
        });
        if (attempt < maxAttempts) {
          await delay(300);
          continue;
        }
        return null;
      }

      const email = payload as {
        text?: unknown;
        html?: unknown;
        headers?: unknown;
        raw?: { download_url?: unknown } | null;
      };
      const text = typeof email.text === 'string' && email.text.trim() ? email.text.trim() : '';
      const html = typeof email.html === 'string' && email.html.trim() ? email.html.trim() : '';
      const headers = toHeaderMap(email.headers);
      const content = text || stripHtml(html);
      if (!content.trim()) {
        const rawDownloadUrl =
          email.raw && typeof email.raw === 'object' && 'download_url' in email.raw && typeof email.raw.download_url === 'string'
            ? email.raw.download_url
            : null;
        console.warn('[support email] received email has no text/html content', {
          emailId,
          attempt,
          hasText: Boolean(text),
          hasHtml: Boolean(html),
          hasRawDownloadUrl: Boolean(rawDownloadUrl),
        });
        return null;
      }

      return {
        text: content.trim(),
        headers,
      };
    } catch (error) {
      console.warn('[support email] unexpected error while fetching received email content', {
        emailId,
        attempt,
        error: toErrorMessage(error),
      });
      if (attempt < maxAttempts) {
        await delay(300);
        continue;
      }
      return null;
    }
  }

  return null;
};

const parseMessageIds = (value: string | undefined): string[] => {
  if (!value) return [];
  const ids = value.match(/<[^>]+>/g) ?? [];
  return Array.from(new Set(ids.map((item) => item.trim()))).filter(Boolean);
};

const resolveThreadId = (eventMessageId: string, headers: Record<string, string>): string => {
  const inReplyTo = parseMessageIds(headers['in-reply-to']);
  if (inReplyTo.length > 0) return inReplyTo[0];

  const references = parseMessageIds(headers.references);
  if (references.length > 0) return references[0];

  return eventMessageId;
};

const toModelMessages = (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Array<{ role: 'user' | 'assistant'; content: string }> => {
  return messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0);
};

export const processInboundSupportEmail = async (event: ResendReceivedEvent): Promise<void> => {
  if (event.type !== 'email.received') return;
  const emailId = event.data?.email_id?.trim();
  const from = event.data?.from?.trim();
  const subject = event.data?.subject?.trim() ?? '';
  const eventMessageId = event.data?.message_id?.trim();
  if (!emailId || !from || !eventMessageId) return;

  const senderEmail = parseSenderEmail(from);
  if (!senderEmail) {
    console.warn('[support email] ignored event with unparseable sender address', { from });
    return;
  }

  const received = await getReceivedBodyAndHeaders(emailId);
  if (!received) {
    console.warn('[support email] unable to parse inbound content after retrieval attempts', { emailId });
    return;
  }

  const incomingText = received.text.trim();
  if (!incomingText) {
    console.warn('[support email] inbound email text is empty after normalization', { emailId });
    return;
  }

  const threadId = resolveThreadId(eventMessageId, received.headers);
  let conversation = await readChatConversationByMediumAndThread({
    medium: 'email',
    emailThreadId: threadId,
  });

  if (!conversation) {
    conversation = await createChatConversation({
      userId: null,
      medium: 'email',
      emailThreadId: threadId,
      title: subject.slice(0, 80),
    });
  }

  const conversationId = conversation.id;
  if (!conversationId) {
    console.warn('[support email] conversation has no id', { emailId });
    return;
  }

  try {
    await createMessage({
      conversationId,
      role: 'user',
      content: incomingText,
      externalMessageId: eventMessageId,
    });
  } catch (error) {
    // Duplicate provider message id in the same conversation means we already processed this inbound event.
    if (isUniqueConstraintError(error)) {
      console.warn('[support email] duplicate inbound message detected, skipping', {
        conversationId,
        inboundMessageId: eventMessageId,
      });
      return;
    }
    throw error;
  }

  const history = toModelMessages([
    ...conversation.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: 'user', content: incomingText },
  ]);

  const reply = await withRequestContext(
    {
      locale: defaultUILocale,
      contentLocale: getContentLocale(defaultUILocale),
    },
    () =>
      generateSupportReplyText(history, {
        forcePublic: true,
        includeCitations: false,
        outputFormat: 'plain',
        replyStyle: 'formal_email',
      }),
  );

  const historicalMessageIds = [
    ...conversation.messages.map((message) => message.externalMessageId).filter((value): value is string => Boolean(value)),
    eventMessageId,
  ].filter((value) => value.startsWith('<') && value.endsWith('>'));

  const referenceChain = Array.from(new Set(historicalMessageIds));
  const headers: Record<string, string> = {};
  if (referenceChain.length > 0) {
    const inReplyTo = referenceChain[referenceChain.length - 1];
    headers['In-Reply-To'] = inReplyTo;
    headers.References = referenceChain.join(' ');
  }

  const sent = await sendEmail({
    to: senderEmail,
    replyTo: process.env.BOT_SUPPORT_MAIL?.trim() || undefined,
    subject: subject ? `Re: ${subject}` : 'Re: Support request',
    text: reply.text,
    headers,
  });

  await createMessage({
    conversationId,
    role: 'assistant',
    content: reply.text,
    externalMessageId: sent.id,
    citations: [],
  });
};
