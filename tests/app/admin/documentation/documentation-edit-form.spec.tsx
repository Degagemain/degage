import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { DocumentationEditForm } from '@/app/admin/documentation/components/documentation-edit-form';
import { emptyManualDocumentation } from '@/app/admin/documentation/components/empty-manual-documentation';
import { documentation } from '../../../builders/documentation.builder';

describe('DocumentationEditForm format field', () => {
  beforeEach(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ records: [] }),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('shows a format selector when creating', () => {
    render(<DocumentationEditForm initialDocumentation={emptyManualDocumentation()} />);

    expect(screen.getByText('format')).toBeTruthy();
    const trigger = document.querySelector('[data-slot="select-trigger"]');
    expect(trigger).toBeTruthy();
    expect(trigger?.textContent).toContain('filters.formatMarkdown');
  });

  it('shows a format selector when editing an existing document', () => {
    render(<DocumentationEditForm initialDocumentation={documentation({ source: 'manual', format: 'text' })} />);

    expect(screen.getByText('format')).toBeTruthy();
    const trigger = document.querySelector('[data-slot="select-trigger"]');
    expect(trigger).toBeTruthy();
    expect(trigger?.textContent).toContain('filters.formatText');
  });
});
