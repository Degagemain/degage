import { GoogleGenAI } from '@google/genai';
import type { EmbedContentResponse, Schema } from '@google/genai';

const INFERENCE_MODEL = 'gemini-2.5-pro';
const EMBEDDING_MODEL = 'gemini-embedding-001';

type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

const getClient = (): GoogleGenAI => {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates an embedding for the given text.
 * @param text - The text to generate an embedding for.
 * @param taskType - The task type to use for the embedding.
 * @returns The embedding as a number array.
 */
export async function generateEmbedding(text: string, taskType: EmbeddingTaskType = 'RETRIEVAL_DOCUMENT'): Promise<number[]> {
  const ai = getClient();
  let response: EmbedContentResponse;
  try {
    response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        taskType,
        outputDimensionality: 1536, // Kept below 2000 so we can store in PgVector
      },
    });
  } catch (error) {
    console.error('[embeddings] Gemini embedContent failed', { taskType, inputLength: text.length, error });
    throw error;
  }

  const values = response.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error('Gemini embedding response is empty');
  }

  return values;
}

/**
 * Single-call structured JSON generation (no grounding).
 * Use when the model's training data is sufficient and web search is not needed.
 * @param prompt - The prompt to send to Gemini.
 * @param responseSchema - The schema to use for the response.
 * @returns The structured JSON as a typed object.
 */
export async function generateStructuredJson<T>(prompt: string, responseSchema: Schema): Promise<T> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: INFERENCE_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: responseSchema,
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty response');
  }

  return JSON.parse(response.text) as T;
}

/**
 * Sends a prompt to Gemini with Google Search grounding, then extracts
 * structured JSON from the grounded response using the provided schema.
 * @param prompt - The prompt to send to Gemini.
 * @param responseSchema - The schema to use for the response.
 * @returns The structured JSON as a typed object.
 */
export async function generateGroundedJson<T>(prompt: string, responseSchema: Schema): Promise<T> {
  const ai = getClient();

  const groundedResponse = await ai.models.generateContent({
    model: INFERENCE_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  if (!groundedResponse.text) {
    throw new Error('Gemini grounded search returned an empty response');
  }

  const structuredResponse = await ai.models.generateContent({
    model: INFERENCE_MODEL,
    contents: [
      'Extract the data from the following text into the requested JSON structure.',
      'Return only the JSON object, no additional text.\n\n',
      groundedResponse.text,
    ].join(' '),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: responseSchema,
    },
  });

  if (!structuredResponse.text) {
    throw new Error('Gemini structured extraction returned an empty response');
  }

  return JSON.parse(structuredResponse.text) as T;
}
