import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { updateDocumentation } from '@/actions/documentation/update';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationUpdateBodySchema, documentationUpdateMcpInputSchema } from '@/mcp/tools/documentation-input-schemas';

export const registerUpdateDocumentationTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'update_documentation',
    {
      description:
        'Replace a documentation article. Use search_documentation to load the current record, ' +
        'change the desired fields, then send the complete object including all translations. ' +
        'This is a full replace, not a partial update. Generates search embeddings after save; unchanged content is skipped.',
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
          () => updateDocumentation(doc),
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
