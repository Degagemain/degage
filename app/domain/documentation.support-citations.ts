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

export const toChatCitationsForSupportViewer = (
  citations: DocumentationSupportCitation[],
  viewer: UserWithRole | null | undefined,
): ChatCitation[] => {
  if (viewer && isAdmin(viewer)) {
    return citations.map((c) => ({ title: c.title, url: c.url }));
  }
  return citations
    .filter((c) => c.isPublic)
    .map((c) => ({
      title: c.title,
      url: documentationFaqArticlePath(c.externalId),
    }));
};
