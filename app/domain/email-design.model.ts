import * as z from 'zod';

export const emailDesignVariableSchema = z.object({
  key: z.string().min(1),
  type: z.enum(['string', 'number']),
  fallbackValue: z.union([z.string(), z.number()]).nullable(),
});

export type EmailDesignVariable = z.infer<typeof emailDesignVariableSchema>;

export const emailDesignSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    alias: z.string().nullable(),
    status: z.enum(['draft', 'published']),
    variables: z.array(emailDesignVariableSchema).default([]),
  })
  .strict();

export type EmailDesign = z.infer<typeof emailDesignSchema>;
