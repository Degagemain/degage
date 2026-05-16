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

const getNotionOptionName = (prop: unknown): string => {
  const typed = prop as { type?: unknown; select?: unknown; status?: unknown };
  if (!typed || typeof typed !== 'object' || (typed.type !== 'select' && typed.type !== 'status') || typed[typed.type] === undefined) {
    return '';
  }

  const value = typed[typed.type];
  if (!value || typeof value !== 'object' || !('name' in value) || typeof value.name !== 'string') {
    return '';
  }

  return value.name.trim();
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

const readNotionPropertyText = (prop: unknown): string => {
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

  return getNotionOptionName(prop);
};

export const getNotionPropertyPlainText = (page: NotionPageWithProps, propName: string): string => {
  const exact = page.properties[propName];
  if (exact !== undefined) {
    return readNotionPropertyText(exact).trim();
  }

  const lower = propName.toLowerCase();
  for (const [key, prop] of Object.entries(page.properties)) {
    if (key.toLowerCase() === lower) {
      return readNotionPropertyText(prop).trim();
    }
  }
  return '';
};
