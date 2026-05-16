import { Client } from '@notionhq/client';
import { type ContentLocale, isContentLocale } from '@/i18n/locales';
import { dbDocumentationUpsertNotion } from '@/storage/documentation/documentation.upsert-notion';
import { dbDocumentationDeleteByExternalId } from '@/storage/documentation/documentation.delete-by-external-id';
import { notionExternalId } from '@/storage/documentation/documentation.upsert-notion';
import { type NotionPageWithProps, getNotionPropertyPlainText } from '@/actions/notion/notion-page-properties';

const getEnv = (key: string): string | undefined => process.env[key];

const richTextToPlain = (items: { plain_text: string }[]): string => items.map((i) => i.plain_text).join('');
const DEFAULT_NOTION_DOC_LANGUAGE_PROPERTY = 'Language';
const DEFAULT_NOTION_DOC_PARENT_KEY_PROPERTY = 'Parent';

type NotionRichTextItem = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
  text?: {
    content?: string;
    link?: { url?: string } | null;
  };
};

type NotionBlock = {
  id?: string;
  type?: string;
  has_children?: boolean;
} & Record<string, unknown>;

type NotionBlocksClient = {
  blocks: {
    children: {
      list: (args: { block_id: string; start_cursor?: string; page_size?: number }) => Promise<{
        results: unknown[];
        has_more?: boolean;
        next_cursor?: string | null;
      }>;
    };
  };
};

const findTitleFromProperties = (page: NotionPageWithProps): string => {
  for (const [, prop] of Object.entries(page.properties)) {
    if (prop && typeof prop === 'object' && 'type' in prop && prop.type === 'title' && 'title' in prop && Array.isArray(prop.title)) {
      const t = richTextToPlain(prop.title as { plain_text: string }[]);
      if (t.trim()) return t.trim();
    }
  }
  return 'Untitled';
};

const getBlockPayload = (block: NotionBlock): Record<string, unknown> | null => {
  if (!block.type) return null;
  const payload = block[block.type];
  return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
};

const getBlockRichText = (block: NotionBlock): NotionRichTextItem[] => {
  const richText = getBlockPayload(block)?.rich_text;
  return Array.isArray(richText) ? (richText as NotionRichTextItem[]) : [];
};

const richTextToMarkdown = (items: NotionRichTextItem[]): string => {
  return items
    .map((item) => {
      let text = item.plain_text ?? item.text?.content ?? '';
      if (!text) return '';

      const annotations = item.annotations;
      if (annotations?.code) text = `\`${text.replaceAll('`', '\\`')}\``;
      if (annotations?.bold) text = `**${text}**`;
      if (annotations?.italic) text = `_${text}_`;
      if (annotations?.strikethrough) text = `~~${text}~~`;

      const url = item.href ?? item.text?.link?.url;
      if (!url) return text;

      const label = text.trim();
      if (!label) return text;

      const leading = text.match(/^\s*/)?.[0] ?? '';
      const trailing = text.match(/\s*$/)?.[0] ?? '';
      return `${leading}[${label}](${url})${trailing}`;
    })
    .join('');
};

const blockToMarkdown = (block: NotionBlock): string => {
  const text = richTextToMarkdown(getBlockRichText(block)).trim();

  switch (block.type) {
    case 'paragraph':
      return text;
    case 'heading_1':
      return text ? `# ${text}` : '';
    case 'heading_2':
      return text ? `## ${text}` : '';
    case 'heading_3':
      return text ? `### ${text}` : '';
    case 'bulleted_list_item':
      return text ? `- ${text}` : '';
    case 'numbered_list_item':
      return text ? `1. ${text}` : '';
    case 'to_do': {
      const checked = getBlockPayload(block)?.checked === true ? 'x' : ' ';
      return text ? `- [${checked}] ${text}` : '';
    }
    case 'quote':
    case 'callout':
      return text ? `> ${text}` : '';
    case 'code': {
      const payload = getBlockPayload(block);
      const language = typeof payload?.language === 'string' ? payload.language : '';
      const code = richTextToPlain(getBlockRichText(block).map((item) => ({ plain_text: item.plain_text ?? item.text?.content ?? '' })));
      return `\`\`\`${language}\n${code}\n\`\`\``;
    }
    case 'divider':
      return '---';
    default:
      return '';
  }
};

const indentMarkdown = (markdown: string): string =>
  markdown
    .split('\n')
    .map((line) => (line.trim() ? `  ${line}` : line))
    .join('\n');

export const notionBlocksToMarkdown = async (notion: NotionBlocksClient, blockId: string, depth = 0): Promise<string> => {
  const blocks: NotionBlock[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({ block_id: blockId, start_cursor: startCursor, page_size: 100 });
    blocks.push(...(response.results.filter((block) => block && typeof block === 'object') as NotionBlock[]));
    startCursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
  } while (startCursor);

  const markdownBlocks: string[] = [];
  for (const block of blocks) {
    const markdown = blockToMarkdown(block);
    if (markdown) {
      markdownBlocks.push(depth > 0 ? indentMarkdown(markdown) : markdown);
    }
    if (block.has_children && block.id) {
      const childMarkdown = await notionBlocksToMarkdown(notion, block.id, depth + 1);
      if (childMarkdown) {
        markdownBlocks.push(childMarkdown);
      }
    }
  }

  return markdownBlocks.join('\n\n').trimEnd();
};

export const resolveNotionTranslationInput = (
  page: NotionPageWithProps,
  content: string,
): { parentKey: string; translation: { locale: ContentLocale; title: string; content: string } } => {
  const languageProp = getEnv('NOTION_DOC_LANGUAGE_PROPERTY')?.trim() || DEFAULT_NOTION_DOC_LANGUAGE_PROPERTY;
  const parentKeyProp = getEnv('NOTION_DOC_PARENT_KEY_PROPERTY')?.trim() || DEFAULT_NOTION_DOC_PARENT_KEY_PROPERTY;

  const locale = getNotionPropertyPlainText(page, languageProp).toLowerCase();
  if (!isContentLocale(locale)) {
    throw new Error(`Notion documentation page must define a supported language in "${languageProp}"`);
  }

  const parentKey = getNotionPropertyPlainText(page, parentKeyProp);
  if (!parentKey) {
    throw new Error(`Notion documentation page must define a parent key in "${parentKeyProp}"`);
  }

  return {
    parentKey,
    translation: {
      locale,
      title: findTitleFromProperties(page),
      content,
    },
  };
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

  const content = await notionBlocksToMarkdown(notion, pageId);
  const input = resolveNotionTranslationInput(pageWithProps, content);

  await dbDocumentationUpsertNotion({
    parentKey: input.parentKey,
    translation: input.translation,
  });
};

export const deleteNotionDocumentation = async (pageId: string): Promise<void> => {
  await dbDocumentationDeleteByExternalId(notionExternalId(pageId));
};
