import { type ContentLocale, isContentLocale } from '@/i18n/locales';

export type NotionPageWithProps = { properties: Record<string, unknown> };

const richTextToPlain = (items: { plain_text: string }[]): string => items.map((i) => i.plain_text).join('');

export const getNotionPageProperty = (page: NotionPageWithProps, propName: string): unknown => {
  if (Object.prototype.hasOwnProperty.call(page.properties, propName)) {
    return page.properties[propName];
  }
  const lower = propName.toLowerCase();
  for (const [key, val] of Object.entries(page.properties)) {
    if (key.toLowerCase() === lower) {
      return val;
    }
  }
  return undefined;
};

export const getNotionMultiSelectNames = (prop: unknown): string[] => {
  if (
    !prop ||
    typeof prop !== 'object' ||
    !('type' in prop) ||
    prop.type !== 'multi_select' ||
    !('multi_select' in prop) ||
    !Array.isArray((prop as { multi_select: unknown }).multi_select)
  ) {
    return [];
  }
  const items = (prop as { multi_select: { name?: string | null }[] }).multi_select;
  return items.map((item) => (item && typeof item.name === 'string' ? item.name.trim() : '')).filter(Boolean);
};

export const isNotionRichText = (prop: unknown): prop is { rich_text: { plain_text: string }[] } =>
  Boolean(
    prop &&
      typeof prop === 'object' &&
      'type' in prop &&
      prop.type === 'rich_text' &&
      'rich_text' in prop &&
      Array.isArray((prop as { rich_text: unknown }).rich_text),
  );

export const parseLocaleNotionPropertyMap = (raw: string | undefined): Partial<Record<ContentLocale, string>> => {
  const out: Partial<Record<ContentLocale, string>> = {};
  if (!raw?.trim()) return out;
  for (const part of raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const loc = part.slice(0, eq).trim();
    const prop = part.slice(eq + 1).trim();
    if (!isContentLocale(loc) || !prop) continue;
    out[loc] = prop;
  }
  return out;
};

export const getNotionPropertyPlainText = (page: NotionPageWithProps, propName: string): string => {
  const read = (prop: unknown): string => {
    if (isNotionRichText(prop)) {
      return richTextToPlain(prop.rich_text);
    }
    if (
      prop &&
      typeof prop === 'object' &&
      'type' in prop &&
      prop.type === 'title' &&
      'title' in prop &&
      Array.isArray((prop as { title: unknown }).title)
    ) {
      return richTextToPlain((prop as { title: { plain_text: string }[] }).title);
    }
    return '';
  };

  const exact = page.properties[propName];
  if (exact !== undefined) {
    return read(exact).trim();
  }

  const lower = propName.toLowerCase();
  for (const [key, prop] of Object.entries(page.properties)) {
    if (key.toLowerCase() === lower) {
      return read(prop).trim();
    }
  }
  return '';
};
