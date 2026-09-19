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

describe('DocumentationEditForm type and visibility', () => {
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

  it('renders type and article visibility as selects for articles', () => {
    render(<DocumentationEditForm initialDocumentation={emptyManualDocumentation()} />);

    expect(screen.getByText('isFaq')).toBeTruthy();
    expect(screen.getByText('isPublic')).toBeTruthy();
    expect(screen.getByText('isPublicHelp')).toBeTruthy();
    const triggers = Array.from(document.querySelectorAll('[data-slot="select-trigger"]'));
    expect(triggers.some((el) => el.textContent?.includes('type.article'))).toBe(true);
    expect(triggers.some((el) => el.textContent?.includes('visibility.hidden'))).toBe(true);
  });

  it('hides article visibility when the document is a FAQ', () => {
    render(<DocumentationEditForm initialDocumentation={documentation({ source: 'manual', isFaq: true })} />);

    expect(screen.getByText('isFaq')).toBeTruthy();
    expect(screen.queryByText('isPublic')).toBeNull();
  });

  it('hides FAQ lists when the document is an article', () => {
    render(<DocumentationEditForm initialDocumentation={emptyManualDocumentation()} />);

    expect(screen.queryByText('tags')).toBeNull();
  });

  it('shows FAQ lists as a checkbox table when the document is a FAQ', () => {
    render(<DocumentationEditForm initialDocumentation={documentation({ source: 'manual', isFaq: true })} />);

    expect(screen.getByText('tags')).toBeTruthy();
    expect(screen.getByText('code')).toBeTruthy();
    expect(screen.getByText('description')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'simulation_step_1' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'car_onboarding_all' })).toBeTruthy();
  });

  it('does not show the source field', () => {
    render(<DocumentationEditForm initialDocumentation={documentation({ source: 'manual' })} />);

    expect(screen.queryByText('source')).toBeNull();
  });
});
