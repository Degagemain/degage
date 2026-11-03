import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchableSelect } from '@/app/components/ui/searchable-select';

const messages = {
  common: {
    search: 'Search…',
    noResults: 'No results.',
    loading: 'Loading…',
    loadError: 'Could not load the list.',
    tryAgain: 'Try again',
  },
};

const renderSelect = () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SearchableSelect value="" onValueChange={vi.fn()} apiPath="fuel-types" placeholder="Pick one" />
    </NextIntlClientProvider>,
  );
};

describe('SearchableSelect', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows a retry state when the request fails, and loads the options on retry', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ records: [{ id: '1', name: 'Diesel' }], total: 1 }), { status: 200 }));
    renderSelect();

    fireEvent.click(screen.getByRole('combobox'));

    expect(await screen.findByText('Could not load the list.')).toBeTruthy();
    expect(screen.queryByText('No results.')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Diesel')).toBeTruthy();
    expect(screen.queryByText('Could not load the list.')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
