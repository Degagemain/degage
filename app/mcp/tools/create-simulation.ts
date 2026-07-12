import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ZodError } from 'zod';
import { createSimulation } from '@/actions/simulation/create';
import { buildPublicSimulationUrl } from '@/actions/simulation/notify-simulation-result-emails';
import { withRequestContext } from '@/context/request-context';
import { type Simulation, SimulationResultCode, simulationRunInputParseSchema } from '@/domain/simulation.model';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { simulationCreateMcpInputSchema } from '@/mcp/tools/simulation-input-schemas';

const resultCodeLabel: Record<SimulationResultCode, string> = {
  [SimulationResultCode.CATEGORY_A]: 'Category A',
  [SimulationResultCode.CATEGORY_B]: 'Category B',
  [SimulationResultCode.NOT_OK]: 'Not OK',
  [SimulationResultCode.MANUAL_REVIEW]: 'Manual review',
};

function formatEuro(value: number | null | undefined): string {
  if (value == null) return '—';
  return `€ ${value.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildSimulationSummary(simulation: Simulation, publicUrl: string): string {
  const lines = [
    '## Simulation result',
    '',
    `- **Result:** ${resultCodeLabel[simulation.resultCode] ?? simulation.resultCode}`,
    `- **Town:** ${simulation.town.name ?? simulation.town.id}`,
    `- **Car:** ${simulation.brand.name ?? simulation.brand.id} · ${simulation.fuelType.name ?? simulation.fuelType.id} · ${simulation.carType?.name ?? simulation.carTypeOther ?? '—'}`,
    `- **Estimated car value:** ${formatEuro(simulation.resultEstimatedCarValue)}`,
    `- **Km rate:** ${simulation.resultRoundedKmCost != null ? `€ ${simulation.resultRoundedKmCost.toFixed(2)}/km` : '—'}`,
    `- **Insurance / year:** ${formatEuro(simulation.resultInsuranceCostPerYear)}`,
    `- **Tax / year:** ${formatEuro(simulation.resultTaxCostPerYear)}`,
  ];

  if (simulation.rejectionReason) {
    lines.push(`- **Rejection reason:** ${simulation.rejectionReason}`);
  }

  if (simulation.error) {
    lines.push(`- **Engine error:** ${simulation.error}`);
  }

  lines.push(
    '',
    `**Public simulation link:** ${publicUrl}`,
    '',
    'Full simulation JSON:',
    '```json',
    JSON.stringify(simulation, null, 2),
    '```',
  );

  return lines.join('\n');
}

export const registerCreateSimulationTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'create_simulation',
    {
      description:
        'Run and persist a car eligibility simulation. ' +
        'Requires town, brand, fuel type, and car type (or carTypeOther) as { id, name } objects — use search_towns, search_car_brands, search_fuel_types, and search_car_types first. ' +
        'Returns a human-readable summary, a public result link, and the full simulation JSON.',
      inputSchema: simulationCreateMcpInputSchema,
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

      try {
        const validated = simulationRunInputParseSchema.parse(input);

        const simulation = await withRequestContext(
          {
            locale: defaultUILocale,
            contentLocale: getContentLocale(defaultUILocale),
            userId: ctx.userId,
          },
          () => createSimulation(validated),
        );

        if (!simulation.id) {
          return {
            content: [{ type: 'text' as const, text: 'Simulation was not saved.' }],
            isError: true,
          };
        }

        const publicUrl = buildPublicSimulationUrl(simulation.id);

        return {
          content: [{ type: 'text' as const, text: buildSimulationSummary(simulation, publicUrl) }],
        };
      } catch (error) {
        if (error instanceof ZodError) {
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ code: 'validation_error', errors: error.issues }, null, 2) }],
            isError: true,
          };
        }

        throw error;
      }
    },
  );
};
