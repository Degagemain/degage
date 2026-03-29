import * as z from 'zod';

export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const roleValues = [Role.ADMIN, Role.USER] as const;
export const roleSchema = z.enum(roleValues);

export type UserWithRole = {
  id: string;
  role?: string | null;
  banned?: boolean | null;
};
