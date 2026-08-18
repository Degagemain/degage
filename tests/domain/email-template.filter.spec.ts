import { describe, expect, it } from 'vitest';
import { EmailTemplateSortColumns, emailTemplateFilterSchema } from '@/domain/email-template.filter';
import { SortOrder } from '@/domain/utils';

describe('emailTemplateFilterSchema', () => {
  it('defaults sort to code ascending', () => {
    const result = emailTemplateFilterSchema.parse({});

    expect(result.sortBy).toBe(EmailTemplateSortColumns.CODE);
    expect(result.sortOrder).toBe(SortOrder.ASC);
  });

  it('accepts designId as a sort column', () => {
    const result = emailTemplateFilterSchema.parse({ sortBy: 'designId', sortOrder: 'desc' });

    expect(result.sortBy).toBe('designId');
    expect(result.sortOrder).toBe('desc');
  });
});
