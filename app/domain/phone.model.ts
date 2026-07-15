import * as z from 'zod';

const stripPhoneSeparators = (value: string): string => value.replace(/[\s.\-/()]/g, '');

export const isValidPhoneNumber = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  let digits = stripPhoneSeparators(trimmed);

  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  } else if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (!/^\d+$/.test(digits)) return false;

  return digits.length >= 8 && digits.length <= 15;
};

export const nullablePhoneNumberSchema = z
  .string()
  .nullable()
  .refine((value) => value == null || isValidPhoneNumber(value));
