import * as z from 'zod';
import { uiLocales } from '@/i18n/locales';
import { DEFAULT_LOCALE } from './locale.model';
import { roleSchema } from './role.model';

export const userSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    emailVerified: z.boolean().default(false),
    image: z.string().nullable().default(null),
    locale: z.string().nullable().default(DEFAULT_LOCALE),
    role: roleSchema.nullable().default(null),
    banned: z.boolean().nullable().default(false),
    banReason: z.string().nullable().default(null),
    banExpires: z.coerce.date().nullable().default(null),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .strict();

export type User = z.infer<typeof userSchema>;

export const userLocaleUpdateSchema = z
  .object({
    locale: z.enum(uiLocales),
  })
  .strict();

export type UserLocaleUpdate = z.infer<typeof userLocaleUpdateSchema>;
