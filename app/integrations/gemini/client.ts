/**
 * Gemini integration — grounded Google Search with structured JSON output.
 * No domain or business logic; just prompt + schema in, typed data out.
 *
 * Gemini does not support Google Search grounding and structured JSON output
 * in the same request. This module works around that by making two calls:
 *   1. Grounded search call (plain text) to gather real-world data.
 *   2. Structured extraction call (JSON mode) to parse the result into `T`.
 */
import { GoogleGenAI } from '@google/genai';
import type { Schema } from '@google/genai';

const MODEL = 'gemini-2.5-flash';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey });
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

  console.log(groundedResponse.text);

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
