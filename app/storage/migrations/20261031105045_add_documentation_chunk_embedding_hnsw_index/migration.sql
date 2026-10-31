-- CreateIndex
-- Prisma has no hnsw index type, so the generated btree statement is replaced by
-- the pgvector index. The name must match @@index(map:) in schema.prisma.
-- IF NOT EXISTS: an earlier migration created this index, and a later one dropped
-- it because the schema did not declare it. Databases that still have the index
-- must accept this migration.
CREATE INDEX IF NOT EXISTS "DocumentationChunk_embedding_hnsw_idx" ON "DocumentationChunk" USING hnsw ("embedding" vector_cosine_ops);
