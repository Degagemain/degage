import { describe, expect, it } from 'vitest';

import { documentationFromEditForm, isDocumentationContentLocked } from '@/app/admin/documentation/components/documentation-from-edit-form';
import { emptyManualDocumentation } from '@/app/admin/documentation/components/empty-manual-documentation';
import { documentation } from '../../../builders/documentation.builder';

describe('isDocumentationContentLocked', () => {
  it('is unlocked for new and manual documents', () => {
    expect(isDocumentationContentLocked(emptyManualDocumentation())).toBe(false);
    expect(isDocumentationContentLocked(documentation({ source: 'manual' }))).toBe(false);
  });

  it('is locked for repository documents', () => {
    expect(isDocumentationContentLocked(documentation({ source: 'repository' }))).toBe(true);
  });
});

describe('documentationFromEditForm', () => {
  it('uses the selected format when creating', () => {
    const created = documentationFromEditForm(emptyManualDocumentation(), {
      format: 'text',
      isFaq: false,
      isPublic: false,
      groups: [],
      translations: [{ locale: 'en', title: 'Hello', content: 'World' }],
      audienceRoles: [],
      tags: [],
    });

    expect(created.format).toBe('text');
    expect(created.source).toBe('manual');
    expect(created.id).toBeNull();
  });

  it('keeps a format change when editing a manual document', () => {
    const initial = documentation({ source: 'manual', format: 'text' });
    const saved = documentationFromEditForm(initial, {
      format: 'markdown',
      isFaq: initial.isFaq,
      isPublic: initial.isPublic,
      groups: initial.groups,
      translations: initial.translations,
      audienceRoles: initial.audienceRoles,
      tags: initial.tags,
    });

    expect(saved.format).toBe('markdown');
    expect(saved.id).toBe(initial.id);
  });

  it('allows changing format on synced documents', () => {
    const initial = documentation({ source: 'repository', format: 'text' });
    const saved = documentationFromEditForm(initial, {
      format: 'markdown',
      isFaq: initial.isFaq,
      isPublic: initial.isPublic,
      groups: initial.groups,
      translations: initial.translations,
      audienceRoles: ['user'],
      tags: ['simulation_step_1'],
    });

    expect(saved.format).toBe('markdown');
    expect(saved.audienceRoles).toEqual(initial.audienceRoles);
    expect(saved.tags).toEqual(initial.tags);
  });
});
