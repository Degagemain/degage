import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/resend', () => ({
  getResendClient: vi.fn(),
}));

import { listEmailDesigns } from '@/actions/email-design/list';
import { readEmailDesign } from '@/actions/email-design/read';
import { ResendNotConfiguredError } from '@/actions/email-design/resend-not-configured.error';
import { getResendClient } from '@/integrations/resend';
import { NotFoundError } from '@/actions/app.error';

describe('listEmailDesigns', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws when Resend is not configured', async () => {
    vi.mocked(getResendClient).mockReturnValueOnce(null);
    await expect(listEmailDesigns()).rejects.toBeInstanceOf(ResendNotConfiguredError);
  });

  it('returns mapped designs', async () => {
    const list = vi.fn().mockResolvedValueOnce({
      data: {
        data: [{ id: 'tmpl-1', name: 'Button', alias: 'button-email', status: 'published' }],
        has_more: false,
      },
      error: null,
    });
    vi.mocked(getResendClient).mockReturnValueOnce({ templates: { list } } as never);

    const designs = await listEmailDesigns();
    expect(designs).toEqual([{ id: 'tmpl-1', name: 'Button', alias: 'button-email', status: 'published', variables: [] }]);
  });
});

describe('readEmailDesign', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps variables from Resend', async () => {
    const get = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'tmpl-1',
        name: 'Button',
        alias: 'button-email',
        status: 'published',
        variables: [{ key: 'SUBJECT', type: 'string', fallback_value: '' }],
      },
      error: null,
    });
    vi.mocked(getResendClient).mockReturnValueOnce({ templates: { get } } as never);

    const design = await readEmailDesign('button-email');
    expect(design.variables).toEqual([{ key: 'SUBJECT', type: 'string', fallbackValue: '' }]);
  });

  it('throws not found when Resend returns not_found', async () => {
    const get = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { name: 'not_found', message: 'Missing', statusCode: 404 },
    });
    vi.mocked(getResendClient).mockReturnValueOnce({ templates: { get } } as never);

    await expect(readEmailDesign('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
