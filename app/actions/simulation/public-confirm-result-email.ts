import * as z from 'zod';
import { readSimulation } from '@/actions/simulation/read';
import { updateSimulation } from '@/actions/simulation/update';
import { SimulationResultCode } from '@/domain/simulation.model';

function isSuccessResultForPublicEmail(code: SimulationResultCode): boolean {
  return code === SimulationResultCode.CATEGORY_A || code === SimulationResultCode.CATEGORY_B || code === SimulationResultCode.HIGHER_RATE;
}

const publicConfirmResultEmailBodySchema = z
  .object({
    id: z.uuid(),
    email: z.string().email(),
  })
  .strict();

export async function publicConfirmResultEmail(body: unknown): Promise<void> {
  const parsed = publicConfirmResultEmailBodySchema.parse(body);
  const simulation = await readSimulation(parsed.id);
  if (!isSuccessResultForPublicEmail(simulation.resultCode) || simulation.error != null) {
    return;
  }
  await updateSimulation({ id: parsed.id, email: parsed.email });
}
