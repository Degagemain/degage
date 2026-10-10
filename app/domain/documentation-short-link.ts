import * as z from 'zod';

export const documentationShortLinkMaxLength = 64;

export const reservedDocumentationShortLinks = ['articles', 'groups'] as const;

const documentationShortLinkPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type DocumentationShortLinkProblem = 'invalid' | 'reserved';

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
  if ((reservedDocumentationShortLinks as readonly string[]).includes(value)) {
    return 'reserved';
  }
  return null;
};

export const documentationShortLinkSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    const normalized = normalizeDocumentationShortLink(value);
    const problem = documentationShortLinkProblem(normalized);
    if (problem === 'invalid') {
      ctx.addIssue({ code: 'custom', message: 'Short link must use letters, numbers, and hyphens' });
      return z.NEVER;
    }
    if (problem === 'reserved') {
      ctx.addIssue({ code: 'custom', message: 'Short link is reserved' });
      return z.NEVER;
    }
    return normalized;
  });

export const documentationWithPublicShortLink = <T extends { isPublic: boolean; shortLink: string | null }>(doc: T): T => {
  if (doc.isPublic || doc.shortLink == null) {
    return doc;
  }
  return { ...doc, shortLink: null };
};
