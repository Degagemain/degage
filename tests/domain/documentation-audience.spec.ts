import { describe, expect, it } from 'vitest';

import { canViewDocumentation, documentationRequiresAdminViewer } from '@/domain/documentation-audience.utils';

describe('documentation audience', () => {
  it('requires admin viewer when technical or admin role present', () => {
    expect(documentationRequiresAdminViewer(['public', 'user'])).toBe(false);
    expect(documentationRequiresAdminViewer(['admin'])).toBe(true);
    expect(documentationRequiresAdminViewer(['technical'])).toBe(true);
  });

  it('canViewDocumentation matches admin gate', () => {
    expect(canViewDocumentation(['public'], false)).toBe(true);
    expect(canViewDocumentation(['admin'], false)).toBe(false);
    expect(canViewDocumentation(['admin'], true)).toBe(true);
  });
});
