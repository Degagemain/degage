import { google } from '@ai-sdk/google';
import { type UIMessage, convertToModelMessages, generateText, stepCountIs, streamText } from 'ai';
import { z } from 'zod';
import { searchDocumentationForRag } from '@/actions/documentation/search-rag';
import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import { Role, type UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { type ChatCitation } from '@/domain/chat.model';
import { type DocumentationSupportCitation, toChatCitationsForSupportViewer } from '@/domain/documentation.support-citations';
import { type ContentLocale } from '@/i18n/locales';
import { isPostHogEnabled } from '@/integrations/posthog';
import { getSupportReplyToEmail } from '@/actions/utils';
import { getSystemParameterByCode } from '@/actions/system-parameter/read';
import {
  type SupportAssistantPromptChannel,
  getDefaultSupportAssistantBasePrompt,
  supportAssistantPromptSystemParameterCodes,
} from '@/domain/support-assistant-prompt.model';

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

const getConfiguredBasePrompt = async (channel: SupportAssistantPromptChannel): Promise<string> => {
  const parameter = await getSystemParameterByCode(supportAssistantPromptSystemParameterCodes[channel]);
  const configuredPrompt = parameter?.valueString?.trim();
  return configuredPrompt || getDefaultSupportAssistantBasePrompt(channel, getSupportReplyToEmail());
};

const buildSystemPrompt = async (input: {
  channel: SupportAssistantPromptChannel;
  userLocale?: string | null;
  includeCitations: boolean;
  outputFormat: 'markdown' | 'plain';
}): Promise<string> => {
  const parts = [await getConfiguredBasePrompt(input.channel)];

  if (input.includeCitations) {
    parts.push('Never put [1], [2], or similar numeric citation markers in your answer; the UI lists sources with links after your message.');
  } else {
    parts.push('Do not include source lists, citation markers, links to sources, or references to numbered citations in your answer.');
  }

  if (input.outputFormat === 'plain') {
    parts.push('Return plain text only. Do not use markdown formatting, markdown headings, bullet lists, code fences, or markdown tables.');
  }

  if (input.userLocale && input.userLocale.trim()) {
    parts.push(`The authenticated user's preferred language is "${input.userLocale.trim()}". Prioritize this language when replying.`);
  }

  return parts.join(' ');
};

const getViewerAudienceRole = (
  viewer: UserWithRole | null | undefined,
  forcePublic: boolean,
  audienceOverride?: DocumentationAudienceRole | null,
): DocumentationAudienceRole => {
  if (forcePublic || !viewer) return 'public';
  if (audienceOverride && isAdmin(viewer)) {
    return audienceOverride;
  }
  return isAdmin(viewer) ? Role.ADMIN : Role.USER;
};

type CommonSupportOptions = {
  viewer?: UserWithRole | null;
  forcePublic?: boolean;
  audienceOverride?: DocumentationAudienceRole | null;
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
  let latestRagCitations: DocumentationSupportCitation[] = [];

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: await buildSystemPrompt({
      channel: options.replyStyle === 'formal_email' ? 'email' : 'chat',
      includeCitations,
      outputFormat: options.outputFormat ?? 'markdown',
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
          const viewerAudienceRole = getViewerAudienceRole(options.viewer, options.forcePublic ?? false, options.audienceOverride);
          const search = await searchDocumentationForRag(query, {
            viewerAudienceRole,
            ...(options.searchLocales?.length ? { locales: options.searchLocales } : {}),
          });
          latestRagCitations = includeCitations ? search.citations : [];
          return search;
        },
      },
    },
    onFinish: async ({ text }) => {
      if (!options.onFinish) return;
      await options.onFinish({
        text,
        citations: includeCitations ? toChatCitationsForSupportViewer(latestRagCitations, options.viewer) : [],
      });
    },
  });

  return {
    result,
    getLatestCitations: () => (includeCitations ? toChatCitationsForSupportViewer(latestRagCitations, options.viewer) : []),
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
  let latestRagCitations: DocumentationSupportCitation[] = [];

  const response = await generateText({
    model: google('gemini-2.5-flash'),
    system: await buildSystemPrompt({
      channel: options.replyStyle === 'formal_email' ? 'email' : 'chat',
      includeCitations,
      outputFormat,
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
          const viewerAudienceRole = getViewerAudienceRole(options.viewer, options.forcePublic ?? false, options.audienceOverride);
          const search = await searchDocumentationForRag(query, {
            viewerAudienceRole,
            ...(options.searchLocales?.length ? { locales: options.searchLocales } : {}),
          });
          latestRagCitations = includeCitations ? search.citations : [];
          return search;
        },
      },
    },
  });

  const text = outputFormat === 'plain' ? toPlainText(response.text) : response.text.trim();
  return {
    text,
    citations: includeCitations ? toChatCitationsForSupportViewer(latestRagCitations, options.viewer) : [],
  };
};
