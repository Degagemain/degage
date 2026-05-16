import { afterEach, describe, expect, it, vi } from 'vitest';
import { SystemParameterCategory, SystemParameterType } from '@/domain/system-parameter.model';
import { supportAssistantPromptSystemParameterCodes } from '@/domain/support-assistant-prompt.model';

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((model: string) => ({ model })),
}));

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({ text: 'assistant reply' }),
  streamText: vi.fn(),
  stepCountIs: vi.fn((count: number) => ({ count })),
  convertToModelMessages: vi.fn(async (messages: unknown) => messages),
}));

vi.mock('@/actions/documentation/search-rag', () => ({
  searchDocumentationForRag: vi.fn(),
}));

vi.mock('@/actions/system-parameter/read', () => ({
  getSystemParameterByCode: vi.fn(),
}));

vi.mock('@/integrations/posthog', () => ({
  isPostHogEnabled: false,
}));

import { generateText } from 'ai';
import { getSystemParameterByCode } from '@/actions/system-parameter/read';
import { generateSupportReplyText } from '@/actions/support/generate-reply';

const promptParameter = (code: string, valueString: string) => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  code,
  category: SystemParameterCategory.ASSISTANT,
  type: SystemParameterType.STRING,
  name: code,
  description: '',
  translations: [],
  valueNumber: null,
  valueNumberMin: null,
  valueNumberMax: null,
  valueEuronormId: null,
  valueString,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('generateSupportReplyText', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses the configured chat widget base prompt', async () => {
    vi.mocked(getSystemParameterByCode).mockResolvedValueOnce(
      promptParameter(supportAssistantPromptSystemParameterCodes.chat, 'Configured chat widget base prompt'),
    );

    await generateSupportReplyText([{ role: 'user', content: 'Hello' }], { replyStyle: 'chat' });

    expect(getSystemParameterByCode).toHaveBeenCalledWith(supportAssistantPromptSystemParameterCodes.chat);
    expect(vi.mocked(generateText).mock.calls[0]?.[0].system).toContain('Configured chat widget base prompt');
  });

  it('uses the configured email base prompt for formal email replies', async () => {
    vi.mocked(getSystemParameterByCode).mockResolvedValueOnce(
      promptParameter(supportAssistantPromptSystemParameterCodes.email, 'Configured email base prompt'),
    );

    await generateSupportReplyText([{ role: 'user', content: 'Hello' }], { replyStyle: 'formal_email' });

    expect(getSystemParameterByCode).toHaveBeenCalledWith(supportAssistantPromptSystemParameterCodes.email);
    expect(vi.mocked(generateText).mock.calls[0]?.[0].system).toContain('Configured email base prompt');
  });
});
