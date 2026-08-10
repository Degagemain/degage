export interface HighlightedTextPart {
  text: string;
  isMatch: boolean;
}

export const getHighlightedTextParts = (value: string, query: string): HighlightedTextPart[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [{ text: value, isMatch: false }];

  const parts: HighlightedTextPart[] = [];
  const normalizedValue = value.toLowerCase();
  let cursor = 0;
  let matchIndex = normalizedValue.indexOf(normalizedQuery);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push({ text: value.slice(cursor, matchIndex), isMatch: false });
    }
    const matchEnd = matchIndex + normalizedQuery.length;
    parts.push({ text: value.slice(matchIndex, matchEnd), isMatch: true });
    cursor = matchEnd;
    matchIndex = normalizedValue.indexOf(normalizedQuery, cursor);
  }

  if (cursor < value.length) {
    parts.push({ text: value.slice(cursor), isMatch: false });
  }

  return parts.length > 0 ? parts : [{ text: value, isMatch: false }];
};
