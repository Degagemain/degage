import { describe, expect, it } from 'vitest';

import { isValidPhoneNumber, nullablePhoneNumberSchema } from '@/domain/phone.model';

describe('isValidPhoneNumber', () => {
  it.each(['0470000001', '+32 470 00 00 00', '0032 470 00 00 01', '02 123 45 67', '050 12 34 56', '32470000001'])(
    'accepts valid Belgian number %s',
    (value) => {
      expect(isValidPhoneNumber(value)).toBe(true);
    },
  );

  it.each(['', 'abc', '123', '+31 6 12345678', '0470', '047000000001'])('rejects invalid number %s', (value) => {
    expect(isValidPhoneNumber(value)).toBe(false);
  });
});

describe('nullablePhoneNumberSchema', () => {
  it('allows null', () => {
    expect(nullablePhoneNumberSchema.safeParse(null).success).toBe(true);
  });

  it('accepts valid phone numbers', () => {
    expect(nullablePhoneNumberSchema.safeParse('0470000001').success).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(nullablePhoneNumberSchema.safeParse('not-a-phone').success).toBe(false);
  });
});
