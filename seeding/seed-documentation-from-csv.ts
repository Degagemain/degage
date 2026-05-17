import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PrismaClient } from '@/storage/client/client';
import {
  type DocumentationAudienceRole,
  type DocumentationFormat,
  type DocumentationTag,
  documentationAudienceRoleSchema,
  documentationFormatSchema,
  documentationTagSchema,
} from '@/domain/documentation.model';
import { dbDocumentationGetByExternalId } from '@/storage/documentation/documentation.get-by-external-id';
import { dbDocumentationUpsertManual } from '@/storage/documentation/documentation.upsert-manual';

const CSV_PATH = join(process.cwd(), 'seeding', 'documentation.csv');

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

const stripBom = (value: string): string => value.replace(/^\uFEFF/, '');

type CsvRow = {
  name: string;
  contentEn: string;
  contentFr: string;
  contentNl: string;
  faq: string;
  format: string;
  roles: string;
  tags: string;
  titleEn: string;
  titleFr: string;
  titleNl: string;
};

const columnIndex = (header: string[], name: string): number => {
  const index = header.indexOf(name);
  if (index < 0) {
    throw new Error(`documentation.csv must include a ${name} column`);
  }
  return index;
};

const rowFromCells = (cells: string[], col: Record<keyof CsvRow, number>): CsvRow => ({
  name: cells[col.name] ?? '',
  contentEn: cells[col.contentEn] ?? '',
  contentFr: cells[col.contentFr] ?? '',
  contentNl: cells[col.contentNl] ?? '',
  faq: cells[col.faq] ?? '',
  format: cells[col.format] ?? '',
  roles: cells[col.roles] ?? '',
  tags: cells[col.tags] ?? '',
  titleEn: cells[col.titleEn] ?? '',
  titleFr: cells[col.titleFr] ?? '',
  titleNl: cells[col.titleNl] ?? '',
});

const parseYesNo = (value: string): boolean => value.trim().toLowerCase() === 'yes';

const parseAudienceRoles = (value: string): DocumentationAudienceRole[] => {
  const roles: DocumentationAudienceRole[] = [];
  for (const part of value.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const parsed = documentationAudienceRoleSchema.safeParse(trimmed);
    if (parsed.success) {
      roles.push(parsed.data);
    }
  }
  return roles;
};

const parseTags = (value: string): DocumentationTag[] => {
  const tags: DocumentationTag[] = [];
  for (const part of value.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const parsed = documentationTagSchema.safeParse(trimmed);
    if (parsed.success) {
      tags.push(parsed.data);
    }
  }
  return tags;
};

const parseFormat = (value: string): DocumentationFormat => {
  const parsed = documentationFormatSchema.safeParse(value.trim().toLowerCase());
  return parsed.success ? parsed.data : 'text';
};

const toManualDocInput = (row: CsvRow) => {
  const audienceRoles = parseAudienceRoles(row.roles);
  return {
    externalId: row.name.trim(),
    isFaq: parseYesNo(row.faq),
    isPublic: audienceRoles.includes('public'),
    format: parseFormat(row.format),
    audienceRoles,
    tags: parseTags(row.tags),
    translations: [
      { locale: 'en', title: row.titleEn.trim(), content: row.contentEn },
      { locale: 'fr', title: row.titleFr.trim(), content: row.contentFr },
      { locale: 'nl', title: row.titleNl.trim(), content: row.contentNl },
    ],
  };
};

export async function seedDocumentationFromCsv(_prisma: PrismaClient): Promise<void> {
  const raw = readFileSync(CSV_PATH, 'utf-8');
  const table = parseCsv(raw);
  if (table.length < 2) {
    console.log('Documentation CSV is empty, skipping.');
    return;
  }

  const header = table[0]!.map(stripBom);
  const col = {
    name: columnIndex(header, 'Name'),
    contentEn: columnIndex(header, 'ContentEn'),
    contentFr: columnIndex(header, 'ContentFr'),
    contentNl: columnIndex(header, 'ContentNl'),
    faq: columnIndex(header, 'FAQ'),
    format: columnIndex(header, 'Format'),
    roles: columnIndex(header, 'Roles'),
    tags: columnIndex(header, 'Tags'),
    titleEn: columnIndex(header, 'TitleEn'),
    titleFr: columnIndex(header, 'TitleFr'),
    titleNl: columnIndex(header, 'TitleNl'),
  };

  const firstDataRow = table[1]!;
  const firstName = stripBom(firstDataRow[col.name] ?? '').trim();
  if (!firstName) {
    throw new Error('documentation.csv first data row has an empty Name');
  }

  const existing = await dbDocumentationGetByExternalId(firstName);
  if (existing) {
    console.log(`Documentation CSV already seeded (${firstName} exists), skipping.`);
    return;
  }

  let seeded = 0;
  for (let i = 1; i < table.length; i++) {
    const cells = table[i]!;
    const row = rowFromCells(cells, col);
    const externalId = row.name.trim();
    if (!externalId) {
      continue;
    }
    await dbDocumentationUpsertManual(toManualDocInput(row));
    seeded++;
  }

  console.log(`Documentation CSV seed: upserted ${seeded} manual document(s).`);
}
