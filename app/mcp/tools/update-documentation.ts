import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { updateDocumentation } from '@/actions/documentation/update';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationUpdateBodySchema, documentationUpdateMcpInputSchema } from '@/mcp/tools/documentation-input-schemas';

export const registerUpdateDocumentationTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'update_documentation',
    {
      description:
        'Replace a documentation record with the full JSON body (same as PUT /api/documentation/{id}). ' +
        'Fetch the current article via GET /api/documentation/{id}, change the desired fields, then send the complete object including all translations.',
      inputSchema: documentationUpdateMcpInputSchema,
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
        const doc = documentationUpdateBodySchema.parse(input);
        const updated = await withRequestContext(
          {
            locale: defaultUILocale,
            contentLocale: getContentLocale(defaultUILocale),
            userId: ctx.userId,
          },
          async () => {
            const saved = await updateDocumentation(doc);
            if (saved.id) {
              await embedDocumentationById(saved.id);
            }
            return saved;
          },
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(updated, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update documentation';
        return {
          content: [{ type: 'text' as const, text: message }],
          isError: true,
        };
      }
    },
  );
};
