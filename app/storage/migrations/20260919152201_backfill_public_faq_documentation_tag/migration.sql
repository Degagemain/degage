UPDATE "Documentation"
SET tags = ARRAY['public_faq']::"DocumentationTag"[]
WHERE "isFaq" = true
  AND tags = '{}';
