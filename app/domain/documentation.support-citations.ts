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

const adminDocumentationPathPattern = /^\/app\/admin\/documentation\/(.+)$/;

export const normalizeSupportChatCitationForViewer = (citation: ChatCitation, viewer: UserWithRole | null | undefined): ChatCitation => {
  if (viewer && isAdmin(viewer)) {
    return citation;
  }

  const adminMatch = citation.url.match(adminDocumentationPathPattern);
  if (adminMatch?.[1]) {
    return {
      title: citation.title,
      url: documentationFaqArticlePath(decodeURIComponent(adminMatch[1])),
    };
  }

  return citation;
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
        };
      }

      return { title: c.title, url: c.url };
    });
};
