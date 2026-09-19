import { describe, expect, it } from 'vitest';

import {
  canViewDocumentation,
  documentationRequiresAdminViewer,
  documentationSearchVisibleAudiences,
  documentationViewerHasPrivilegedDocSearchAccess,
  keepWidestDocumentationAudienceRoles,
} from '@/domain/documentation-audience.utils';

describe('documentation audience', () => {
  it('requires admin viewer when admin role is present', () => {
    expect(documentationRequiresAdminViewer(['public', 'user'])).toBe(false);
    expect(documentationRequiresAdminViewer(['admin'])).toBe(true);
  });

  it('canViewDocumentation matches admin gate', () => {
    expect(canViewDocumentation(['public'], false)).toBe(true);
    expect(canViewDocumentation(['admin'], false)).toBe(false);
    expect(canViewDocumentation(['admin'], true)).toBe(true);
  });

  it('documentationViewerHasPrivilegedDocSearchAccess matches RAG chunk search gate', () => {
    expect(documentationViewerHasPrivilegedDocSearchAccess('admin')).toBe(true);
    expect(documentationViewerHasPrivilegedDocSearchAccess('user')).toBe(false);
    expect(documentationViewerHasPrivilegedDocSearchAccess('public')).toBe(false);
  });

  it('documentationSearchVisibleAudiences matches list search policy', () => {
    expect(documentationSearchVisibleAudiences({ isViewerAdmin: true, isAuthenticated: true })).toEqual(['admin', 'user', 'public']);
    expect(documentationSearchVisibleAudiences({ isViewerAdmin: false, isAuthenticated: true })).toEqual(['user', 'public']);
    expect(documentationSearchVisibleAudiences({ isViewerAdmin: false, isAuthenticated: false })).toEqual(['public']);
  });

  it('keepWidestDocumentationAudienceRoles drops narrower overlapping roles', () => {
    expect(keepWidestDocumentationAudienceRoles(['public', 'user', 'admin'])).toEqual(['public']);
    expect(keepWidestDocumentationAudienceRoles(['admin', 'public'])).toEqual(['public']);
    expect(keepWidestDocumentationAudienceRoles(['user', 'admin'])).toEqual(['user']);
    expect(keepWidestDocumentationAudienceRoles(['admin'])).toEqual(['admin']);
    expect(keepWidestDocumentationAudienceRoles(['user', 'user'])).toEqual(['user']);
    expect(keepWidestDocumentationAudienceRoles([])).toEqual([]);
  });
});
