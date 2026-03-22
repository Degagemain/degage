import matter from 'gray-matter';
import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import type { PrismaClient } from '@/storage/client/client';
import type { DocumentationAudienceRole, DocumentationTag } from '@/domain/documentation.model';
import { documentationAudienceRoleSchema, documentationTagSchema } from '@/domain/documentation.model';
import { contentLocales } from '@/i18n/locales';
import { dbDocumentationDeleteRepositoryNotIn, dbDocumentationUpsertRepository } from '@/storage/documentation/documentation.upsert-repository';

const DOCS_ROOT = path.join(process.cwd(), 'docs');

type LocaleFile = {
  locale: string;
  basename: string;
  title: string;
  content: string;
  audienceRoles: DocumentationAudienceRole[];
  tags: DocumentationTag[];
  isFaq: boolean;
};

const extractFirstHeading = (markdown: string): string | null => {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() ?? null;
};

const parseAudienceFromFrontMatter = (data: Record<string, unknown>): DocumentationAudienceRole[] => {
  const raw = data.roles;
  if (!Array.isArray(raw)) {
    return ['admin'];
  }
  const out: DocumentationAudienceRole[] = [];
  for (const r of raw) {
    const p = documentationAudienceRoleSchema.safeParse(r);
    if (p.success) {
      out.push(p.data);
    }
  }
  return out.length > 0 ? out : ['admin'];
};

const parseTagsFromFrontMatter = (data: Record<string, unknown>): DocumentationTag[] => {
  const raw = data.tags;
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: DocumentationTag[] = [];
  for (const r of raw) {
    const p = documentationTagSchema.safeParse(r);
    if (p.success) {
      out.push(p.data);
    }
  }
  return out;
};

const parseBool = (value: unknown): boolean => {
  return value === true || value === 'true';
};

export async function seedDocumentationFromRepo(_prisma: PrismaClient): Promise<void> {
  if (!existsSync(DOCS_ROOT)) {
    console.log('No docs/ directory, skipping documentation seed.');
    return;
  }

  const files: LocaleFile[] = [];

  for (const locale of contentLocales) {
    const dir = path.join(DOCS_ROOT, locale);
    if (!existsSync(dir)) {
      continue;
    }
    const names = readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const name of names) {
      const full = path.join(dir, name);
      const raw = readFileSync(full, 'utf-8');
      const parsed = matter(raw);
      const data = parsed.data as Record<string, unknown>;
      const basename = name.replace(/\.md$/i, '');
      const body = parsed.content.trimStart();
      const titleFromFm = typeof data.title === 'string' ? data.title.trim() : '';
      const title = titleFromFm || extractFirstHeading(body) || basename;

      files.push({
        locale,
        basename,
        title,
        content: body,
        audienceRoles: parseAudienceFromFrontMatter(data),
        tags: parseTagsFromFrontMatter(data),
        isFaq: parseBool(data.isFaq),
      });
    }
  }

  const byBasename = new Map<string, LocaleFile[]>();
  for (const f of files) {
    const list = byBasename.get(f.basename) ?? [];
    list.push(f);
    byBasename.set(f.basename, list);
  }

  const externalIds: string[] = [];

  for (const [basename, locales] of byBasename) {
    const externalId = `repo:${basename}`;
    externalIds.push(externalId);

    const sorted = [...locales].sort(
      (a, b) =>
        contentLocales.indexOf(a.locale as (typeof contentLocales)[number]) -
        contentLocales.indexOf(b.locale as (typeof contentLocales)[number]),
    );
    const translations = sorted.map((l) => ({
      locale: l.locale,
      title: l.title,
      content: l.content,
    }));

    const isFaq = sorted.some((l) => l.isFaq);
    const audienceRoles = [...new Set(sorted.flatMap((l) => l.audienceRoles))] as DocumentationAudienceRole[];
    const tags = [...new Set(sorted.flatMap((l) => l.tags))] as DocumentationTag[];

    await dbDocumentationUpsertRepository({
      externalId,
      isFaq,
      format: 'markdown',
      audienceRoles,
      tags,
      translations,
    });
  }

  await dbDocumentationDeleteRepositoryNotIn(externalIds);
  console.log(`Documentation seed: upserted ${externalIds.length} repo document(s).`);
}
