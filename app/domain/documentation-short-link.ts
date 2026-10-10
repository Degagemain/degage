import * as z from 'zod';

export const documentationShortLinkMaxLength = 64;

const documentationShortLinkPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type DocumentationShortLinkProblem = 'invalid';

export const normalizeDocumentationShortLink = (value: string | null | undefined): string | null => {
  if (value == null) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 ? null : normalized;
};

export const documentationShortLinkProblem = (value: string | null): DocumentationShortLinkProblem | null => {
  if (value == null) {
    return null;
  }
  if (value.length > documentationShortLinkMaxLength || !documentationShortLinkPattern.test(value)) {
    return 'invalid';
  }
  return null;
};

export const documentationShortLinkSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    const normalized = normalizeDocumentationShortLink(value);
    if (documentationShortLinkProblem(normalized) === 'invalid') {
      ctx.addIssue({ code: 'custom', message: 'Short link must use letters, numbers, and hyphens' });
      return z.NEVER;
    }
    return normalized;
  });
