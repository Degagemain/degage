/**
 * Simple LLM interface for Gemini. No domain or business logic — just prompt in, text out.
 * When GEMINI_API_KEY is not set, throws so callers can handle (e.g. use a stub).
 */

export async function generateText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set');
  }
  // TODO: use @google/genai to call Gemini with the prompt, return response text
  // For now, throw so callers use their own stub when key is missing or not yet implemented
  throw new Error('Gemini generateText not yet implemented');
}
