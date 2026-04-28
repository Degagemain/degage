import { Client } from '@notionhq/client';
import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import type { DocumentationFormat } from '@/domain/documentation.model';
import type { DocumentationTag } from '@/domain/documentation.model';
import { documentationAudienceRoleSchema, documentationFormatSchema, documentationTagSchema } from '@/domain/documentation.model';
import { type ContentLocale, contentLocales } from '@/i18n/locales';
import { dbDocumentationUpsertNotion } from '@/storage/documentation/documentation.upsert-notion';
import { dbDocumentationDeleteByExternalId } from '@/storage/documentation/documentation.delete-by-external-id';
import { notionExternalId } from '@/storage/documentation/documentation.upsert-notion';
import {
  type NotionPageWithProps,
  getNotionMultiSelectNames,
  getNotionPageProperty,
  getNotionPropertyPlainText,
  isNotionRichText,
  parseLocaleNotionPropertyMap,
} from '@/actions/notion/notion-page-properties';

const getEnv = (key: string): string | undefined => process.env[key];

const richTextToPlain = (items: { plain_text: string }[]): string => items.map((i) => i.plain_text).join('');

const findTitleFromProperties = (page: NotionPageWithProps): string => {
  for (const [, prop] of Object.entries(page.properties)) {
    if (prop && typeof prop === 'object' && 'type' in prop && prop.type === 'title' && 'title' in prop && Array.isArray(prop.title)) {
      const t = richTextToPlain(prop.title as { plain_text: string }[]);
      if (t.trim()) return t.trim();
    }
  }
  return 'Untitled';
};

const findRichTextProperty = (page: NotionPageWithProps, names: string[]): string => {
  const lowerNames = names.map((n) => n.toLowerCase());
  for (const [key, prop] of Object.entries(page.properties)) {
    if (!lowerNames.includes(key.toLowerCase())) continue;
    if (isNotionRichText(prop)) {
      return richTextToPlain(prop.rich_text);
    }
  }
  return '';
};

const DEFAULT_NOTION_DOC_BODY_PROPERTY_NAMES = ['Content', 'Body'] as const;

const parseAudienceRoles = (raw: string | undefined): DocumentationAudienceRole[] => {
  const defaults: DocumentationAudienceRole[] = ['user', 'public'];
  if (!raw?.trim()) return defaults;
  const out: DocumentationAudienceRole[] = [];
  for (const part of raw.split(',').map((s) => s.trim())) {
    const p = documentationAudienceRoleSchema.safeParse(part);
    if (p.success) out.push(p.data);
  }
  return out.length > 0 ? out : defaults;
};

const parseTags = (raw: string | undefined): DocumentationTag[] => {
  if (!raw?.trim()) return [];
  const out: DocumentationTag[] = [];
  for (const part of raw.split(',').map((s) => s.trim())) {
    const p = documentationTagSchema.safeParse(part);
    if (p.success) out.push(p.data);
  }
  return out;
};

const parseFormat = (raw: string | undefined): DocumentationFormat => {
  const p = documentationFormatSchema.safeParse(raw?.trim() || 'markdown');
  return p.success ? p.data : 'markdown';
};

const resolveTranslations = (
  pageWithProps: NotionPageWithProps,
  defaultTitle: string,
  defaultContent: string,
  titlePropByLocale: Partial<Record<ContentLocale, string>>,
  contentPropByLocale: Partial<Record<ContentLocale, string>>,
): { locale: string; title: string; content: string }[] => {
  return contentLocales.map((locale) => {
    const titleProp = titlePropByLocale[locale];
    const localizedTitle = titleProp ? getNotionPropertyPlainText(pageWithProps, titleProp) : '';
    const title = (localizedTitle || defaultTitle || 'Untitled').trim() || 'Untitled';

    const contentProp = contentPropByLocale[locale];
    const localizedContent = contentProp ? getNotionPropertyPlainText(pageWithProps, contentProp) : '';
    const content = localizedContent || defaultContent;

    return { locale, title, content };
  });
};

export const syncNotionPageToDocumentation = async (pageId: string): Promise<void> => {
  const apiKey = getEnv('NOTION_API_KEY');
  if (!apiKey) {
    throw new Error('NOTION_API_KEY is not configured');
  }

  const notion = new Client({ auth: apiKey });
  const page = await notion.pages.retrieve({ page_id: pageId });
  if (!page || typeof page !== 'object' || !('properties' in page)) {
    return;
  }
  const pageWithProps = page as NotionPageWithProps;

  const defaultContent = findRichTextProperty(pageWithProps, [...DEFAULT_NOTION_DOC_BODY_PROPERTY_NAMES]);
  const defaultTitle = findTitleFromProperties(pageWithProps);

  const titlePropByLocale = parseLocaleNotionPropertyMap(getEnv('NOTION_DOC_LOCALE_TITLE_PROPERTIES'));
  const contentPropByLocale = parseLocaleNotionPropertyMap(getEnv('NOTION_DOC_LOCALE_CONTENT_PROPERTIES'));

  const translations = resolveTranslations(pageWithProps, defaultTitle, defaultContent, titlePropByLocale, contentPropByLocale);

  let isFaq = false;
  const faqProp = getEnv('NOTION_DOC_IS_FAQ_PROPERTY');
  const faqVal = faqProp ? pageWithProps.properties[faqProp] : undefined;
  if (faqVal && typeof faqVal === 'object' && 'type' in faqVal && faqVal.type === 'checkbox' && 'checkbox' in faqVal) {
    isFaq = Boolean(faqVal.checkbox);
  }

  let isPublic = false;
  const publicProp = getEnv('NOTION_DOC_IS_PUBLIC_PROPERTY');
  const publicVal = publicProp ? pageWithProps.properties[publicProp] : undefined;
  if (publicVal && typeof publicVal === 'object' && 'type' in publicVal && publicVal.type === 'checkbox' && 'checkbox' in publicVal) {
    isPublic = Boolean(publicVal.checkbox);
  }

  let audienceRoles = parseAudienceRoles(undefined);
  const audProp = getEnv('NOTION_DOC_AUDIENCE_PROPERTY');
  if (audProp) {
    const audVal = getNotionPageProperty(pageWithProps, audProp);
    const names = getNotionMultiSelectNames(audVal);
    if (names.length > 0) {
      audienceRoles = parseAudienceRoles(names.join(','));
    }
  }

  let tags: DocumentationTag[] = [];
  const tagsProp = getEnv('NOTION_DOC_TAGS_PROPERTY');
  if (tagsProp) {
    const tagsVal = getNotionPageProperty(pageWithProps, tagsProp);
    tags = parseTags(getNotionMultiSelectNames(tagsVal).join(','));
  }

  let format: DocumentationFormat = 'markdown';
  const fmtProp = getEnv('NOTION_DOC_FORMAT_PROPERTY');
  const fmtVal = fmtProp ? pageWithProps.properties[fmtProp] : undefined;
  if (fmtVal && typeof fmtVal === 'object' && 'type' in fmtVal) {
    const sel = 'select' in fmtVal ? fmtVal.select : null;
    if (fmtVal.type === 'select' && sel && typeof sel === 'object' && sel !== null && 'name' in sel) {
      format = parseFormat(String((sel as { name: string }).name));
    } else if (isNotionRichText(fmtVal)) {
      format = parseFormat(richTextToPlain(fmtVal.rich_text));
    }
  }

  await dbDocumentationUpsertNotion({
    notionPageId: pageId,
    isFaq,
    isPublic,
    format,
    audienceRoles,
    tags,
    translations,
  });
};

export const deleteNotionDocumentation = async (pageId: string): Promise<void> => {
  await dbDocumentationDeleteByExternalId(notionExternalId(pageId));
};
