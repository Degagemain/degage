/**
 * Gemini integration — structured JSON output with optional Google Search grounding.
 * No domain or business logic; just prompt + schema in, typed data out.
 *
 * Two public functions:
 *   - generateStructuredJson: single call with JSON schema enforcement.
 *   - generateGroundedJson:   two-step call (grounded search → structured extraction)
 *     because Gemini does not support grounding + JSON mode in the same request.
 */
import { GoogleGenAI } from '@google/genai';
import type { Schema } from '@google/genai';

const MODEL = 'gemini-2.5-pro';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Single-call structured JSON generation (no grounding).
 * Use when the model's training data is sufficient and web search is not needed.
 */
export async function generateStructuredJson<T>(prompt: string, responseSchema: Schema): Promise<T> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: MODEL,
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
 */
export async function generateGroundedJson<T>(prompt: string, responseSchema: Schema): Promise<T> {
  const ai = getClient();

  const groundedResponse = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  if (!groundedResponse.text) {
    throw new Error('Gemini grounded search returned an empty response');
  }

  const structuredResponse = await ai.models.generateContent({
    model: MODEL,
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
