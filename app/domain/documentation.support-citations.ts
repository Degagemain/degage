import type { ChatCitation } from '@/domain/chat.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';

export type DocumentationSupportCitation = {
  title: string;
  /** Admin documentation viewer URL; kept for admin viewers. */
  url: string;
  externalId: string;
  isPublic: boolean;
};

export const documentationFaqArticlePath = (externalId: string): string => {
  return `/app/faq/articles/${encodeURIComponent(externalId)}`;
};

const externalIdFromCitationPath = (url: string, prefix: string): string | null => {
  const index = url.indexOf(prefix);
  if (index === -1) return null;
  const rest = url.slice(index + prefix.length).split(/[?#]/)[0];
  if (!rest) return null;
  try {
    return decodeURIComponent(rest);
  } catch {
    return rest;
  }
};

export const externalIdFromChatCitation = (citation: { externalId?: string | null; url?: string | null }): string | null => {
  const explicit = citation.externalId?.trim();
  if (explicit) return explicit;
  const url = citation.url?.trim() ?? '';
  if (!url) return null;
  return externalIdFromCitationPath(url, '/app/faq/articles/') ?? externalIdFromCitationPath(url, '/app/admin/documentation/');
};

const chatCitationWithUrl = (citation: ChatCitation, url: string): ChatCitation => {
  return citation.externalId ? { title: citation.title, url, externalId: citation.externalId } : { title: citation.title, url };
};

const adminDocumentationPathPattern = /^\/app\/admin\/documentation\/(.+)$/;

export const normalizeSupportChatCitationForViewer = (citation: ChatCitation, viewer: UserWithRole | null | undefined): ChatCitation => {
  if (viewer && isAdmin(viewer)) {
    return citation;
  }

  const adminMatch = citation.url.match(adminDocumentationPathPattern);
  if (adminMatch?.[1]) {
    return chatCitationWithUrl(citation, documentationFaqArticlePath(decodeURIComponent(adminMatch[1])));
  }

  return chatCitationWithUrl(citation, citation.url);
};

export const mergeDocumentationSupportCitations = (
  existing: DocumentationSupportCitation[],
  incoming: DocumentationSupportCitation[],
): DocumentationSupportCitation[] => {
  const seen = new Set(existing.map((citation) => citation.externalId));
  const merged = [...existing];
  for (const citation of incoming) {
    if (seen.has(citation.externalId)) continue;
    seen.add(citation.externalId);
    merged.push(citation);
  }
  return merged;
};

export const toChatCitationsForSupportViewer = (
  citations: DocumentationSupportCitation[],
  viewer: UserWithRole | null | undefined,
): ChatCitation[] => {
  const viewerIsAdmin = Boolean(viewer && isAdmin(viewer));

  return citations
    .filter((c) => viewerIsAdmin || c.isPublic)
    .map((c) => {
      if (c.isPublic) {
        return {
          title: c.title,
          url: documentationFaqArticlePath(c.externalId),
          externalId: c.externalId,
        };
      }

      return { title: c.title, url: c.url, externalId: c.externalId };
    });
};
