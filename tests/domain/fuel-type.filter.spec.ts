import { describe, expect, it } from 'vitest';
import { FuelTypeSortColumns, fuelTypeFilterSchema } from '@/domain/fuel-type.filter';
import { SortOrder } from '@/domain/utils';

describe('fuelTypeFilterSchema', () => {
  it('defaults sort to order ascending', () => {
    const result = fuelTypeFilterSchema.parse({});

    expect(result.sortBy).toBe(FuelTypeSortColumns.ORDER);
    expect(result.sortOrder).toBe(SortOrder.ASC);
  });

  it('accepts order as a sort column', () => {
    const result = fuelTypeFilterSchema.parse({ sortBy: 'order', sortOrder: 'desc' });

    expect(result.sortBy).toBe('order');
    expect(result.sortOrder).toBe('desc');
  });
});
