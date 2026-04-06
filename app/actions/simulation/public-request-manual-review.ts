import * as z from 'zod';
import { readSimulation } from '@/actions/simulation/read';
import { updateSimulation } from '@/actions/simulation/update';
import { SimulationResultCode } from '@/domain/simulation.model';

const publicManualReviewBodySchema = z
  .object({
    id: z.uuid(),
    email: z.string().email(),
  })
  .strict();

export async function publicRequestManualReview(body: unknown): Promise<void> {
  const parsed = publicManualReviewBodySchema.parse(body);
  const simulation = await readSimulation(parsed.id);
  if (simulation.resultCode !== SimulationResultCode.MANUAL_REVIEW) {
    return;
  }
  await updateSimulation({
    id: parsed.id,
    email: parsed.email,
  });
}
