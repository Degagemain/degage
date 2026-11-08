import { google } from '@ai-sdk/google';
import { Output, embed, gateway, generateText } from 'ai';
import type { ZodType } from 'zod';
import { isPostHogEnabled } from '@/integrations/posthog';
import { logger } from '@/lib/logger';

const INFERENCE_MODEL = 'google/gemini-2.5-pro';
const EMBEDDING_MODEL = 'google/gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 1536;

type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

const telemetry = (functionId: string) => ({
  isEnabled: isPostHogEnabled,
  functionId,
});

const readObject = <T>(output: T | undefined, emptyMessage: string): T => {
  if (output == null) {
    throw new Error(emptyMessage);
  }
  return output;
};

export async function generateEmbedding(text: string, taskType: EmbeddingTaskType = 'RETRIEVAL_DOCUMENT'): Promise<number[]> {
  const functionId = taskType === 'RETRIEVAL_QUERY' ? 'documentation-query-embed' : 'documentation-embed';
  try {
    const { embedding } = await embed({
      model: gateway.embedding(EMBEDDING_MODEL),
      value: text,
      providerOptions: {
        google: {
          taskType,
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      },
      experimental_telemetry: telemetry(functionId),
    });
    if (!embedding.length) {
      throw new Error('Gemini embedding response is empty');
    }
    return embedding;
  } catch (error) {
    logger.exception(error, { taskType, inputLength: text.length, integration: 'gemini-embed' });
    throw error;
  }
}

export async function generateStructuredJson<T>(prompt: string, responseSchema: ZodType<T>, functionId: string): Promise<T> {
  const { output } = await generateText({
    model: gateway(INFERENCE_MODEL),
    prompt,
    output: Output.object({ schema: responseSchema }),
    experimental_telemetry: telemetry(functionId),
  });
  return readObject(output, 'Gemini returned an empty response');
}

export async function generateStructuredJsonFromImage<T>(
  prompt: string,
  image: { data: Buffer; mimeType: string },
  responseSchema: ZodType<T>,
  functionId: string,
): Promise<T> {
  const { output } = await generateText({
    model: gateway(INFERENCE_MODEL),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image', image: image.data, mediaType: image.mimeType },
        ],
      },
    ],
    output: Output.object({ schema: responseSchema }),
    experimental_telemetry: telemetry(functionId),
  });
  return readObject(output, 'Gemini returned an empty response');
}

export async function generateGroundedJson<T>(prompt: string, responseSchema: ZodType<T>, functionId: string): Promise<T> {
  // Gemini rejects JSON mode and Google Search in the same request, so search runs first.
  const search = await generateText({
    model: gateway(INFERENCE_MODEL),
    prompt,
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    experimental_telemetry: telemetry(`${functionId}-search`),
  });

  if (!search.text) {
    throw new Error('Gemini grounded search returned an empty response');
  }

  const { output } = await generateText({
    model: gateway(INFERENCE_MODEL),
    prompt: [
      'Extract the data from the following text into the requested JSON structure.',
      'Return only the JSON object, no additional text.',
      search.text,
    ].join('\n\n'),
    output: Output.object({ schema: responseSchema }),
    experimental_telemetry: telemetry(`${functionId}-extract`),
  });

  return readObject(output, 'Gemini structured extraction returned an empty response');
}
