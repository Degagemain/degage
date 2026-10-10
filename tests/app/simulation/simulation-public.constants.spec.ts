import { describe, expect, it } from 'vitest';

import { SIMULATION_FAQ_TAGS, SIMULATION_FAQ_TAG_ALL } from '@/app/simulation/simulation-public.constants';

describe('SIMULATION_FAQ_TAGS', () => {
  it('uses only the shared list on the opening page', () => {
    expect(SIMULATION_FAQ_TAGS.opening).toEqual([SIMULATION_FAQ_TAG_ALL]);
  });

  it('adds the shared list next to each existing screen list', () => {
    expect(SIMULATION_FAQ_TAGS.step1).toEqual(['simulation_all', 'simulation_step_1']);
    expect(SIMULATION_FAQ_TAGS.step2Approved).toEqual(['simulation_all', 'simulation_step_2_approved']);
    expect(SIMULATION_FAQ_TAGS.step2Rejected).toEqual(['simulation_all', 'simulation_step_2_rejected']);
    expect(SIMULATION_FAQ_TAGS.step2Review).toEqual(['simulation_all', 'simulation_step_2_review']);
    expect(SIMULATION_FAQ_TAGS.step3).toEqual(['simulation_all', 'simulation_step_3']);
    expect(SIMULATION_FAQ_TAGS.step4).toEqual(['simulation_all', 'simulation_step_4']);
  });
});
