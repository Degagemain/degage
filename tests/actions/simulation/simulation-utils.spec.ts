import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/get-message', () => ({
  getMessage: vi.fn((path: string, params: Record<string, string | number> = {}) => Promise.resolve(`${path}|${JSON.stringify(params)}`)),
}));

import { addErrorMessage, addInfoMessage, addStep, getSimulationMessage, setCurrentStep } from '@/actions/simulation/simulation-utils';
import { SimulationPhase, SimulationStepCode, SimulationStepIcon } from '@/domain/simulation.model';
import { getMessage } from '@/i18n/get-message';

describe('simulation-utils', () => {
  describe('addStep', () => {
    it('appends a step to the result steps array', () => {
      const result = { steps: [] as { status: string; message: string }[] };
      addStep(result, SimulationStepIcon.OK, 'Mileage OK');
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0]).toEqual({ status: SimulationStepIcon.OK, message: 'Mileage OK' });
    });

    it('appends multiple steps in order', () => {
      const result = { steps: [] as { status: string; message: string }[] };
      addStep(result, SimulationStepIcon.OK, 'First');
      addStep(result, SimulationStepIcon.NOT_OK, 'Second');
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
      expect(result.steps[1].status).toBe(SimulationStepIcon.NOT_OK);
    });
  });

  describe('addInfoMessage', () => {
    it('appends an info step', () => {
      const result = { steps: [] as { status: string; message: string }[] };
      addInfoMessage(result, 'Some info');
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0]).toEqual({ status: SimulationStepIcon.INFO, message: 'Some info' });
    });
  });

  describe('addErrorMessage', () => {
    it('appends an error step', () => {
      const result = { steps: [] as { status: string; message: string }[] };
      addErrorMessage(result, 'Something failed');
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0]).toEqual({ status: SimulationStepIcon.NOT_OK, message: 'Something failed' });
    });
  });

  describe('setCurrentStep', () => {
    it('sets currentStep on the result', () => {
      const result = { steps: [] as { status: string; message: string }[], currentStep: null as string | null };
      setCurrentStep(result, SimulationPhase.PRICE_ESTIMATION);
      expect(result.currentStep).toBe(SimulationPhase.PRICE_ESTIMATION);
    });
  });

  describe('getSimulationMessage', () => {
    it('calls getMessage with simulation.step.{code} and params', async () => {
      const msg = await getSimulationMessage(SimulationStepCode.MILEAGE_LIMIT, { maxMileage: 250_000 });
      expect(msg).toBe('simulation.step.mileage_limit|{"maxMileage":250000}');
      expect(getMessage).toHaveBeenCalledWith('simulation.step.mileage_limit', { maxMileage: 250_000 });
    });

    it('accepts enum code with params', async () => {
      const msg = await getSimulationMessage(SimulationStepCode.KM_RATE_ESTIMATED, { estimated: 0.5 });
      expect(getMessage).toHaveBeenCalledWith('simulation.step.km_rate_estimated', { estimated: 0.5 });
      expect(msg).toContain('simulation.step.km_rate_estimated');
    });
  });
});
