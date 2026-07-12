import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchTowns } from '@/actions/town/search';
import { townFilterSchema } from '@/domain/town.filter';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { townSearchMcpInputSchema } from '@/mcp/tools/town-input-schemas';

const townDisplayLabel = (town: { zip: string; name: string; municipality: string }): string =>
  town.name !== town.municipality ? `${town.zip} ${town.name} (${town.municipality})` : `${town.zip} ${town.name}`;

export const registerSearchTownsTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'search_towns',
    {
      description:
        'List and search towns by zip, name, or municipality, with province and hub details. ' +
        'Returns { records, total } with pagination and optional filters.',
      inputSchema: townSearchMcpInputSchema,
    },
    async (input) => {
      const ctx = getContext();
      if (!ctx) {
        return {
          content: [{ type: 'text' as const, text: 'Unauthorized' }],
          isError: true,
        };
      }

      const gate = canUseMcpTools(ctx, requiredScope);
      if (!gate.ok) {
        return {
          content: [{ type: 'text' as const, text: mcpToolGateErrorMessage(gate.reason) }],
          isError: true,
        };
      }

      const filter = townFilterSchema.parse(input);
      const result = await searchTowns(filter);
      const records = result.records.map((town) => ({
        ...town,
        displayLabel: townDisplayLabel(town),
      }));

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ ...result, records }, null, 2) }],
      };
    },
  );
};
