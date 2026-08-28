import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createDocumentation } from '@/actions/documentation/create';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationCreateBodySchema, documentationCreateMcpInputSchema } from '@/mcp/tools/documentation-input-schemas';

export const registerCreateDocumentationTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'create_documentation',
    {
      description:
        'Create a documentation article. Send the complete object including all translations (en, nl, fr), ' +
        'audience roles, tags, and groups. An empty externalId is replaced with manual:{uuid}. ' +
        'Regenerates search embeddings after save.',
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
        const created = await withRequestContext(
          {
            locale: defaultUILocale,
            contentLocale: getContentLocale(defaultUILocale),
            userId: ctx.userId,
          },
          async () => {
            const saved = await createDocumentation(doc);
            if (saved.id) {
              await embedDocumentationById(saved.id);
            }
            return saved;
          },
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(created, null, 2) }],
        };
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
