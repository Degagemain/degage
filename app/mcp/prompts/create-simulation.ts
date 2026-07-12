import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

const guidanceBody = `You help the user run a car eligibility simulation on the Degage platform.

## Step 1 — Determine the situation

Ask which situation applies:
- **Existing car** — the user already owns the car (\`isPurchased=false\`).
- **Car being purchased** — the user is considering buying a car (\`isPurchased=true\`).

Commercial vehicles (bedrijfswagen) are not supported; stop if the car is a commercial vehicle.

## Step 2 — Collect common inputs (both situations)

Gather:
- **Town** — where the car will be used (zip, name, or municipality).
- **Brand** — car manufacturer.
- **Fuel type** — e.g. petrol, diesel, electric.
- **Car type** — model/body type for that brand and fuel type, or **Other** with a free-text description.
- **Seats** — number of seats (typically 2–9, default 5).
- **Van** — yes/no (\`isVan\`, default false).
- **Owner km/year** — expected km the owner will drive per year (required, > 0).

## Step 3 — Situation-specific inputs

### Existing car (\`isPurchased=false\`)
- **Mileage** — current odometer reading in km.
- **First registration date** — ISO date (YYYY-MM-DD), must not be in the future.
- Do **not** set \`purchasePrice\`.

### Car being purchased (\`isPurchased=true\`)
- **Purchase price** — amount incl. VAT (required).
- Ask whether the car is **brand new**:
  - **Brand new** (\`isNewCar=true\`): set \`mileage=0\`, \`firstRegisteredAt\` to today's date; do not ask for odometer or registration date.
  - **Used purchase** (\`isNewCar=false\`): ask for **mileage** and **first registration date** (same rules as existing car).

## Step 4 — Resolve entities with search tools

Before calling \`create_simulation\`, resolve each entity to \`{ id, name }\`:

1. \`search_towns\` — match the user's town; use the record's \`id\` and \`displayLabel\` or \`name\`.
2. \`search_car_brands\` — match the brand (\`isActive=true\`).
3. \`search_fuel_types\` — match the fuel type (\`isActive=true\`).
4. \`search_car_types\` — requires \`brandId\` and \`fuelTypeId\` from steps 2–3. If no match, set \`carType=null\` and provide \`carTypeOther\`.

Confirm ambiguous matches with the user before proceeding.

## Step 5 — Create the simulation

Call \`create_simulation\` with all collected values. Then:
- Present a clear, readable summary (result category, key costs, rejection reason if any).
- Share the **public simulation link** from the tool response so the user can open the full result.
- Do not invent entity IDs; always use search tool results.`;

export const registerCreateSimulationPrompt = (server: McpServer): void => {
  server.registerPrompt(
    'create_simulation',
    {
      title: 'Create a car simulation',
      description:
        'Guides collecting inputs for an existing car or a car being purchased, resolving entities via search tools, then running create_simulation.',
      argsSchema: {
        situation: z
          .enum(['existing', 'purchase'])
          .optional()
          .describe('Pre-select situation: existing car the user owns, or a car being purchased. Omit to ask the user.'),
      },
    },
    ({ situation }) => {
      const situationHint =
        situation === 'existing'
          ? 'The user already owns the car (isPurchased=false).'
          : situation === 'purchase'
            ? 'The user is considering buying a car (isPurchased=true).'
            : 'Ask the user which situation applies before collecting car-specific fields.';

      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `${guidanceBody}\n\n## Context for this session\n\n${situationHint}`,
            },
          },
        ],
      };
    },
  );
};
