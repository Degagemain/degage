import type { SimulationEngineResult, SimulationResultBuilder } from '@/domain/simulation.model';
import { SimulationPhase, SimulationStepCode, SimulationStepIcon } from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';

export async function getSimulationMessage(
  code: SimulationStepCode,
  params: Record<string, string | number> = {},
): Promise<string> {
  return getMessage(`simulation.step.${code}`, params);
}

export function setCurrentStep(result: SimulationEngineResult, phase: SimulationPhase): void {
  result.currentStep = phase;
}

export function addStep(
  result: SimulationResultBuilder,
  status: SimulationStepIcon,
  message: string,
): void {
  result.steps.push({ status, message });
}

export function addInfoMessage(result: SimulationResultBuilder, message: string): void {
  addStep(result, SimulationStepIcon.INFO, message);
}

export function addErrorMessage(result: SimulationResultBuilder, message: string): void {
  addStep(result, SimulationStepIcon.NOT_OK, message);
}
