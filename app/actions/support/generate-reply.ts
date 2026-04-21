import { google } from '@ai-sdk/google';
import { type UIMessage, convertToModelMessages, generateText, stepCountIs, streamText } from 'ai';
import { z } from 'zod';
import { searchDocumentationForRag } from '@/actions/documentation/search-rag';
import { Role, type UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { type ChatCitation } from '@/domain/chat.model';
import { type ContentLocale } from '@/i18n/locales';
import { isPostHogEnabled } from '@/integrations/posthog';
import { getSupportReplyToEmail } from '@/actions/utils';

const buildSupportSystemPrompt = (): string => {
  const contactEmail = getSupportReplyToEmail();
  return [
    'You are a polite and supportive support assistant for the Dégage platform only.',
    'Help with how Dégage works, setup, workflows, troubleshooting, and anything grounded in product documentation.',
    'Always answer in the same language as the user message.',
    'If the request is clearly unrelated to Dégage car sharing, unrelated coding, trivia, or tasks with no link to this system—politely decline.',
    'Briefly say you only help with Dégage and offer relevant help instead.',
    'Do not role-play unrelated personas, run arbitrary errands, or claim you will act outside this chat.',
    'If the user insists on talking to a human, a real person, or live support, politely explain that this chat is automated.',
    `Direct them to contact ${contactEmail} for human assistance.`,
    'Use the searchDocumentation tool to look up factual product or process details.',
    'Tool results include fullDocuments with complete article text for the best-matching pages.',
    'Ground answers in that full text, not only short excerpts.',
    'Do not invent citations or fake source markers.',
    'If searchDocumentation returns noResults=true, still answer helpfully: note no match, ask a clarifying question, suggest rephrasing.',
  ].join(' ');
};

const SEARCH_DOCUMENTATION_TOOL_DESCRIPTION =
  'Search internal documentation. Returns fullDocuments (complete articles for top matches) ' +
  'and citations—prefer fullDocuments when answering.';

const toPlainText = (value: string): string => {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const buildSystemPrompt = (input: {
  userLocale?: string | null;
  includeCitations: boolean;
  outputFormat: 'markdown' | 'plain';
  replyStyle: 'chat' | 'formal_email';
}): string => {
  const parts = [buildSupportSystemPrompt()];

  if (input.includeCitations) {
    parts.push('Never put [1], [2], or similar numeric citation markers in your answer; the UI lists sources with links after your message.');
  } else {
    parts.push('Do not include source lists, citation markers, links to sources, or references to numbered citations in your answer.');
  }

  if (input.outputFormat === 'plain') {
    parts.push('Return plain text only. Do not use markdown formatting, markdown headings, bullet lists, code fences, or markdown tables.');
  }

  if (input.replyStyle === 'formal_email') {
    const contactEmail = getSupportReplyToEmail();
    parts.push(
      'Write as a formal email reply in plain prose with a professional tone, concise paragraphs, and no markdown.',
      'Include a brief formal greeting at the start and a brief formal closing at the end in the same language as the user.',
      [
        'Clearly state that this is an automated support bot reply and that for further help',
        `they can contact ${contactEmail}, in the same language as the user.`,
      ].join(' '),
    );
  }

  if (input.userLocale && input.userLocale.trim()) {
    parts.push(`The authenticated user's preferred language is "${input.userLocale.trim()}". Prioritize this language when replying.`);
  }

  return parts.join(' ');
};

const getViewerAudienceRole = (viewer: UserWithRole | null | undefined, forcePublic: boolean): Role | 'public' => {
  if (forcePublic || !viewer) return 'public';
  return isAdmin(viewer) ? Role.ADMIN : Role.USER;
};

type CommonSupportOptions = {
  viewer?: UserWithRole | null;
  forcePublic?: boolean;
  includeCitations?: boolean;
  outputFormat?: 'markdown' | 'plain';
  replyStyle?: 'chat' | 'formal_email';
  userLocale?: string | null;
  searchLocales?: readonly ContentLocale[];
};

export const generateSupportReplyStream = async (
  messages: UIMessage[],
  options: CommonSupportOptions & {
    onFinish?: (payload: { text: string; citations: ChatCitation[] }) => Promise<void> | void;
  } = {},
) => {
  const includeCitations = options.includeCitations ?? true;
  let latestCitations: ChatCitation[] = [];

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: buildSystemPrompt({
      includeCitations,
      outputFormat: options.outputFormat ?? 'markdown',
      replyStyle: options.replyStyle ?? 'chat',
      userLocale: options.userLocale,
    }),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    experimental_telemetry: {
      isEnabled: isPostHogEnabled,
      functionId: 'support-chat-stream',
      metadata: {
        ...(options.viewer?.id ? { posthog_distinct_id: options.viewer.id } : {}),
      },
    },
    tools: {
      searchDocumentation: {
        description: SEARCH_DOCUMENTATION_TOOL_DESCRIPTION,
        inputSchema: z.object({
          query: z.string().min(3),
        }),
        execute: async ({ query }) => {
          const viewerAudienceRole = getViewerAudienceRole(options.viewer, options.forcePublic ?? false);
          const search = await searchDocumentationForRag(query, {
            viewerAudienceRole,
            ...(options.searchLocales?.length ? { locales: options.searchLocales } : {}),
          });
          latestCitations = includeCitations ? search.citations : [];
          return search;
        },
      },
    },
    onFinish: async ({ text }) => {
      if (!options.onFinish) return;
      await options.onFinish({
        text,
        citations: includeCitations ? latestCitations : [],
      });
    },
  });

  return {
    result,
    getLatestCitations: () => latestCitations,
  };
};

export const generateSupportReplyText = async (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: CommonSupportOptions = {},
): Promise<{
  text: string;
  citations: ChatCitation[];
}> => {
  const includeCitations = options.includeCitations ?? true;
  const outputFormat = options.outputFormat ?? 'plain';
  let latestCitations: ChatCitation[] = [];

  const response = await generateText({
    model: google('gemini-2.5-flash'),
    system: buildSystemPrompt({
      includeCitations,
      outputFormat,
      replyStyle: options.replyStyle ?? 'chat',
      userLocale: options.userLocale,
    }),
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    stopWhen: stepCountIs(5),
    experimental_telemetry: {
      isEnabled: isPostHogEnabled,
      functionId: 'support-reply-text',
      metadata: {
        ...(options.viewer?.id ? { posthog_distinct_id: options.viewer.id } : {}),
      },
    },
    tools: {
      searchDocumentation: {
        description: SEARCH_DOCUMENTATION_TOOL_DESCRIPTION,
        inputSchema: z.object({
          query: z.string().min(3),
        }),
        execute: async ({ query }) => {
          const viewerAudienceRole = getViewerAudienceRole(options.viewer, options.forcePublic ?? false);
          const search = await searchDocumentationForRag(query, {
            viewerAudienceRole,
            ...(options.searchLocales?.length ? { locales: options.searchLocales } : {}),
          });
          latestCitations = includeCitations ? search.citations : [];
          return search;
        },
      },
    },
  });

  const text = outputFormat === 'plain' ? toPlainText(response.text) : response.text.trim();
  return { text, citations: includeCitations ? latestCitations : [] };
};
