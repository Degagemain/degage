import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchFuelTypes } from '@/actions/fuel-type/search';
import { fuelTypeFilterSchema } from '@/domain/fuel-type.filter';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { fuelTypeSearchMcpInputSchema } from '@/mcp/tools/fuel-type-input-schemas';

export const registerSearchFuelTypesTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'search_fuel_types',
    {
      description:
        'List and search fuel types (e.g. petrol, diesel, electric) with code, price, and CO₂ contribution. ' +
        'Returns { records, total } with pagination and optional text query on names.',
      inputSchema: fuelTypeSearchMcpInputSchema,
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

      const filter = fuelTypeFilterSchema.parse(input);

      const result = await withRequestContext(
        {
          locale: defaultUILocale,
          contentLocale: getContentLocale(defaultUILocale),
          userId: ctx.userId,
        },
        () => searchFuelTypes(filter),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
