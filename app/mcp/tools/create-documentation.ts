import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createDocumentation } from '@/actions/documentation/create';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { logger } from '@/lib/logger';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationCreateBodySchema, documentationCreateMcpInputSchema } from '@/mcp/tools/documentation-input-schemas';

export const registerCreateDocumentationTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'create_documentation',
    {
      description:
        'Create a documentation article. Send the complete object including all translations (en, nl, fr), ' +
        'audience roles, tags, and groups. An empty externalId is replaced with manual:{uuid}. ' +
        'Regenerates search embeddings after save. If embeddings fail, the article is still created — ' +
        'retry with update_documentation using the returned id, do not create again.',
      inputSchema: documentationCreateMcpInputSchema,
    },
    async (input) => {
      const ctx = getContext();
      if (!ctx) {
        return {
          content: [{ type: 'text' as const, text: 'Unauthorized' }],
          isError: true,
        };
      }

      const gate = canUseMcpTools(ctx, requiredScope, true);
      if (!gate.ok) {
        return {
          content: [{ type: 'text' as const, text: mcpToolGateErrorMessage(gate.reason) }],
          isError: true,
        };
      }

      try {
        const doc = documentationCreateBodySchema.parse(input);
        let embedWarning: string | undefined;
        const created = await withRequestContext(
          {
            locale: defaultUILocale,
            contentLocale: getContentLocale(defaultUILocale),
            userId: ctx.userId,
          },
          async () => {
            const saved = await createDocumentation(doc);
            const documentationId = saved.id;
            if (documentationId) {
              try {
                await embedDocumentationById(documentationId);
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to generate embeddings';
                logger.exception(error, { documentationId, phase: 'embed-after-create' });
                embedWarning =
                  `Article created but search embeddings failed: ${message}. ` +
                  `Do not create it again. Retry embeddings with update_documentation using id ${documentationId}.`;
              }
            }
            return saved;
          },
        );

        const content: Array<{ type: 'text'; text: string }> = [{ type: 'text', text: JSON.stringify(created, null, 2) }];
        if (embedWarning) {
          content.push({ type: 'text', text: embedWarning });
        }

        return { content };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create documentation';
        return {
          content: [{ type: 'text' as const, text: message }],
          isError: true,
        };
      }
    },
  );
};
