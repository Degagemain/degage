import { describe, expect, it } from 'vitest';

import { carOnboardingFilterSchema } from '@/domain/car-onboarding.filter';
import { filterToQuery } from '@/storage/car-onboarding/car-onboarding.search';

const ownerA = '60fYgP8vVPPZbEtC5mTcmgMzrgLnAJrv';
const ownerB = 'user_2bNotAUuidOwnerIdExample';

const contains = (value: string) => ({ contains: value, mode: 'insensitive' as const });

describe('car onboarding search filterToQuery', () => {
  it('returns empty where clause when no filters are provided', () => {
    const where = filterToQuery(carOnboardingFilterSchema.parse({}));
    expect(where).toEqual({});
  });

  it('includes owner name and email in the query OR clause', () => {
    const where = filterToQuery(carOnboardingFilterSchema.parse({ query: 'jane' }));
    expect(where).toEqual({
      OR: [
        { street: contains('jane') },
        { houseNumber: contains('jane') },
        { phone: contains('jane') },
        { carTypeOther: contains('jane') },
        { carName: contains('jane') },
        { owner: { name: contains('jane') } },
        { owner: { email: contains('jane') } },
      ],
    });
  });

  it('trims whitespace from query', () => {
    const where = filterToQuery(carOnboardingFilterSchema.parse({ query: '  jane  ' }));
    expect(where.OR).toEqual([
      { street: contains('jane') },
      { houseNumber: contains('jane') },
      { phone: contains('jane') },
      { carTypeOther: contains('jane') },
      { carName: contains('jane') },
      { owner: { name: contains('jane') } },
      { owner: { email: contains('jane') } },
    ]);
  });

  it('omits query clause when query is empty or whitespace', () => {
    expect(filterToQuery(carOnboardingFilterSchema.parse({ query: '' })).OR).toBeUndefined();
    expect(filterToQuery(carOnboardingFilterSchema.parse({ query: '   ' })).OR).toBeUndefined();
  });

  it('filters by ownerIds including Better Auth string ids', () => {
    const where = filterToQuery(carOnboardingFilterSchema.parse({ ownerIds: [ownerA, ownerB] }));
    expect(where).toEqual({
      ownerId: { in: [ownerA, ownerB] },
    });
  });

  it('combines query and ownerIds', () => {
    const where = filterToQuery(carOnboardingFilterSchema.parse({ query: 'jane', ownerIds: [ownerA] }));
    expect(where).toEqual({
      ownerId: { in: [ownerA] },
      OR: [
        { street: contains('jane') },
        { houseNumber: contains('jane') },
        { phone: contains('jane') },
        { carTypeOther: contains('jane') },
        { carName: contains('jane') },
        { owner: { name: contains('jane') } },
        { owner: { email: contains('jane') } },
      ],
    });
  });
});
