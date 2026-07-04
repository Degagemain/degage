import * as z from 'zod';

export const pinkFormAnalysisSchema = z
  .object({
    isPinkForm: z.boolean(),
  })
  .strict();

export type PinkFormAnalysis = z.infer<typeof pinkFormAnalysisSchema>;
