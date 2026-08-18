import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/email-template/email-template.create', () => ({
  dbEmailTemplateCreate: vi.fn(),
}));

import { createEmailTemplate } from '@/actions/email-template/create';
import { dbEmailTemplateCreate } from '@/storage/email-template/email-template.create';
import { emailTemplate } from '../../builders/email-template.builder';

describe('createEmailTemplate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a validated template', async () => {
    const created = emailTemplate({ id: 'new-id' });
    vi.mocked(dbEmailTemplateCreate).mockResolvedValueOnce(created);

    const result = await createEmailTemplate({ ...created, id: null });

    expect(result.id).toBe('new-id');
    expect(dbEmailTemplateCreate).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid payload', async () => {
    await expect(createEmailTemplate({ ...emailTemplate(), code: 'nope' as never })).rejects.toThrow();
    expect(dbEmailTemplateCreate).not.toHaveBeenCalled();
  });
});
