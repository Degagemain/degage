import * as z from 'zod';

export const SUPPORT_CHAT_FEATURE_FLAG = 'support-chat';

export const featureFlagSchema = z
  .object({
    id: z.uuid().nullable(),
    code: z.string().min(1).max(100),
    description: z.string().max(2000).default(''),
    enabled: z.boolean().default(false),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type FeatureFlag = z.infer<typeof featureFlagSchema>;

export const featureFlagEnabledUpdateSchema = z
  .object({
    enabled: z.boolean(),
  })
  .strict();

export type FeatureFlagEnabledUpdate = z.infer<typeof featureFlagEnabledUpdateSchema>;
