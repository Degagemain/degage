import * as z from 'zod';

export const documentationChunkTypeValues = ['title', 'content'] as const;
export const documentationChunkTypeSchema = z.enum(documentationChunkTypeValues);
export type DocumentationChunkType = z.infer<typeof documentationChunkTypeSchema>;

export const documentationChunkSchema = z
  .object({
    id: z.uuid().nullable(),
    documentationId: z.uuid(),
    locale: z.string().min(2).max(5),
    chunkIndex: z.number().int().min(0),
    chunkType: documentationChunkTypeSchema,
    content: z.string(),
    contentHash: z.string().length(64),
    embedding: z.array(z.number()),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type DocumentationChunk = z.infer<typeof documentationChunkSchema>;

export const documentationChunkUpsertItemSchema = documentationChunkSchema.pick({
  documentationId: true,
  locale: true,
  chunkIndex: true,
  chunkType: true,
  content: true,
  contentHash: true,
  embedding: true,
});

export type DocumentationChunkUpsertItem = z.infer<typeof documentationChunkUpsertItemSchema>;
