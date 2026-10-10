import { describe, expect, it } from 'vitest';
import { assistantTurnIsDocumentationGap } from '@/domain/chat-conversation-gap';

describe('assistantTurnIsDocumentationGap', () => {
  it('treats an explicit miss as a gap', () => {
    expect(assistantTurnIsDocumentationGap({ role: 'assistant', noResults: true, citations: [{ title: 'x' }] }, 'email')).toBe(true);
  });

  it('does not treat a known hit or a greeting as a gap', () => {
    expect(assistantTurnIsDocumentationGap({ role: 'assistant', noResults: false, citations: [] }, 'frontend')).toBe(false);
  });

  it('treats historical chat replies with empty citations as a gap', () => {
    expect(assistantTurnIsDocumentationGap({ role: 'assistant', noResults: null, citations: [] }, 'frontend')).toBe(true);
  });

  it('does not treat historical email replies with empty citations as a gap', () => {
    expect(assistantTurnIsDocumentationGap({ role: 'assistant', noResults: null, citations: [] }, 'email')).toBe(false);
  });

  it('ignores user messages', () => {
    expect(assistantTurnIsDocumentationGap({ role: 'user', noResults: true, citations: [] }, 'frontend')).toBe(false);
  });
});
