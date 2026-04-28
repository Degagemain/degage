import { describe, expect, it } from 'vitest';

import { documentationFaqArticlePath, toChatCitationsForSupportViewer } from '@/domain/documentation.support-citations';
import { Role } from '@/domain/role.model';

describe('documentation.support-citations', () => {
  it('documentationFaqArticlePath encodes external id', () => {
    expect(documentationFaqArticlePath('repo:first')).toBe('/app/faq/articles/repo%3Afirst');
  });

  it('keeps admin URLs for admin viewers', () => {
    const out = toChatCitationsForSupportViewer(
      [
        {
          title: 'A',
          url: '/app/admin/documentation/x',
          externalId: 'x',
          isPublic: false,
        },
      ],
      { id: '1', role: Role.ADMIN },
    );
    expect(out).toEqual([{ title: 'A', url: '/app/admin/documentation/x' }]);
  });

  it('filters to public docs and uses FAQ paths for non-admins', () => {
    const out = toChatCitationsForSupportViewer(
      [
        {
          title: 'Hidden',
          url: '/app/admin/documentation/h',
          externalId: 'h',
          isPublic: false,
        },
        {
          title: 'Help',
          url: '/app/admin/documentation/repo%3Apublic',
          externalId: 'repo:public',
          isPublic: true,
        },
      ],
      { id: '1', role: Role.USER },
    );
    expect(out).toEqual([{ title: 'Help', url: '/app/faq/articles/repo%3Apublic' }]);
  });

  it('treats unauthenticated viewers like non-admin for citations', () => {
    const out = toChatCitationsForSupportViewer(
      [
        {
          title: 'Help',
          url: '/app/admin/documentation/a',
          externalId: 'a',
          isPublic: true,
        },
      ],
      null,
    );
    expect(out).toEqual([{ title: 'Help', url: '/app/faq/articles/a' }]);
  });
});
