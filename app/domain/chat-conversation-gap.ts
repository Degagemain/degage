import type { ChatConversationMedium } from './chat.model';

export const citationListIsEmpty = (value: unknown): boolean => !Array.isArray(value) || value.length === 0;

/** True when an assistant turn searched documentation and found nothing. */
export const assistantTurnIsDocumentationGap = (
  message: { role?: string | null; noResults: boolean | null; citations: unknown },
  medium: ChatConversationMedium,
): boolean => {
  if (message.role != null && message.role !== 'assistant') return false;
  if (message.noResults === true) return true;
  if (message.noResults === false) return false;
  // Replies saved before noResults existed leave the flag null. Empty citations on chat are a gap; email did not store citations.
  return medium === 'frontend' && citationListIsEmpty(message.citations);
};
