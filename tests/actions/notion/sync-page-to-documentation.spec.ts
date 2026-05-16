import { afterEach, describe, expect, it, vi } from 'vitest';

import { notionBlocksToMarkdown, resolveNotionTranslationInput } from '@/actions/notion/sync-page-to-documentation';

const originalEnv = process.env;

afterEach(() => {
  process.env = originalEnv;
  vi.clearAllMocks();
});

describe('resolveNotionTranslationInput', () => {
  it('maps one Notion page to one translation using default language and parent fields', () => {
    const input = resolveNotionTranslationInput(
      {
        properties: {
          Name: {
            type: 'title',
            title: [{ plain_text: 'Getting started' }],
          },
          Language: {
            type: 'select',
            select: { name: 'nl' },
          },
          Parent: {
            type: 'rich_text',
            rich_text: [{ plain_text: 'getting-started' }],
          },
          Tags: {
            type: 'multi_select',
            multi_select: [{ name: 'simulation_step_1' }],
          },
        },
      },
      'Markdown body',
    );

    expect(input).toEqual({
      parentKey: 'getting-started',
      translation: {
        locale: 'nl',
        title: 'Getting started',
        content: 'Markdown body',
      },
    });
  });

  it('uses configured language and parent field names', () => {
    process.env = {
      ...originalEnv,
      NOTION_DOC_LANGUAGE_PROPERTY: 'Locale',
      NOTION_DOC_PARENT_KEY_PROPERTY: 'Documentation key',
    };

    const input = resolveNotionTranslationInput(
      {
        properties: {
          Name: {
            type: 'title',
            title: [{ plain_text: 'FAQ' }],
          },
          Locale: {
            type: 'status',
            status: { name: 'fr' },
          },
          'Documentation key': {
            type: 'select',
            select: { name: 'faq' },
          },
        },
      },
      'Bonjour',
    );

    expect(input.translation.locale).toBe('fr');
    expect(input.parentKey).toBe('faq');
  });

  it('rejects pages without a supported language', () => {
    expect(() =>
      resolveNotionTranslationInput(
        {
          properties: {
            Name: {
              type: 'title',
              title: [{ plain_text: 'Bad page' }],
            },
            Language: {
              type: 'select',
              select: { name: 'de' },
            },
            Parent: {
              type: 'rich_text',
              rich_text: [{ plain_text: 'bad-page' }],
            },
          },
        },
        '',
      ),
    ).toThrow('supported language');
  });
});

describe('notionBlocksToMarkdown', () => {
  it('converts supported Notion blocks to markdown and skips unsupported media blocks', async () => {
    const list = vi.fn(async ({ block_id }: { block_id: string }) => ({
      results:
        block_id === 'page'
          ? [
              {
                type: 'heading_1',
                heading_1: { rich_text: [{ plain_text: 'Intro' }] },
              },
              {
                type: 'paragraph',
                paragraph: {
                  rich_text: [
                    { plain_text: 'Hello ' },
                    { plain_text: 'world', annotations: { bold: true } },
                    { plain_text: ' docs', href: 'https://example.com' },
                  ],
                },
              },
              {
                id: 'list-item',
                type: 'bulleted_list_item',
                has_children: true,
                bulleted_list_item: { rich_text: [{ plain_text: 'Parent item' }] },
              },
              {
                type: 'image',
                image: { caption: [{ plain_text: 'Ignored image' }] },
              },
              {
                type: 'code',
                code: {
                  language: 'ts',
                  rich_text: [{ plain_text: 'const value = 1;' }],
                },
              },
            ]
          : [
              {
                type: 'to_do',
                to_do: { checked: true, rich_text: [{ plain_text: 'Child item' }] },
              },
            ],
      has_more: false,
      next_cursor: null,
    }));

    await expect(notionBlocksToMarkdown({ blocks: { children: { list } } }, 'page')).resolves.toBe(
      '# Intro\n\nHello **world** [docs](https://example.com)\n\n- Parent item\n\n  - [x] Child item\n\n```ts\nconst value = 1;\n```',
    );
  });
});
