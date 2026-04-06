import { type SimulationUpdateBody, simulationUpdateBodySchema } from '@/domain/simulation.model';
import { dbSimulationUpdate } from '@/storage/simulation/simulation.update';
import { readSimulation } from '@/actions/simulation/read';
import { isSimulationEligibleForResultEmail, notifySimulationResultEmails } from '@/actions/simulation/notify-simulation-result-emails';

export async function updateSimulation(body: unknown): Promise<SimulationUpdateBody> {
  const parsed = simulationUpdateBodySchema.parse(body);
  const existing = await readSimulation(parsed.id);
  const previousEmail = existing.email ?? null;
  const merged = { ...existing, email: parsed.email };

  await dbSimulationUpdate(merged);

  if (isSimulationEligibleForResultEmail(merged) && merged.email != null && merged.email !== previousEmail) {
    await notifySimulationResultEmails(merged, { recipientEmail: merged.email });
  }

  return parsed;
}
