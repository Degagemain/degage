import { describe, expect, it } from 'vitest';

import { anonymizeRefusedReason } from '../../scripts/anonymize-guard';

describe('anonymizeRefusedReason', () => {
  it('allows a preview environment with no flag', () => {
    expect(anonymizeRefusedReason('preview', false)).toBeNull();
  });

  it.each([undefined, '', 'production', 'development'])('refuses VERCEL_ENV %s without --force', (vercelEnv) => {
    expect(anonymizeRefusedReason(vercelEnv, false)).toMatch(/VERCEL_ENV must be preview/);
  });

  it.each([undefined, '', 'production', 'development', 'preview'])('allows VERCEL_ENV %s when --force is passed', (vercelEnv) => {
    expect(anonymizeRefusedReason(vercelEnv, true)).toBeNull();
  });
});
