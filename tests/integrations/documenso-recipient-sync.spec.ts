import { describe, expect, it } from 'vitest';
import { CONTRACT_OWNER_PLACEHOLDER_EMAIL } from '@/domain/contract-type.model';
import { buildTemplateRecipients, planRecipientSync } from '@/integrations/documenso';

describe('planRecipientSync', () => {
  it('creates missing signees and viewers while keeping the owner', () => {
    const desired = buildTemplateRecipients({
      defaultSignee: { email: 'john@degage.be', name: 'John' },
      defaultViewers: [{ email: 'viewer@degage.be', name: 'Viewer' }],
    });
    const plan = planRecipientSync(
      [
        {
          id: 1,
          email: CONTRACT_OWNER_PLACEHOLDER_EMAIL,
          name: 'Owner',
          role: 'SIGNER',
          signingOrder: 1,
        },
      ],
      desired,
    );

    expect(plan.toDelete).toEqual([]);
    expect(plan.toUpdate).toEqual([]);
    expect(plan.toCreate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'john@degage.be', role: 'SIGNER' }),
        expect.objectContaining({ email: 'viewer@degage.be', role: 'CC' }),
      ]),
    );
  });

  it('deletes removed signees and updates changed names', () => {
    const desired = buildTemplateRecipients({
      defaultSignee: { email: 'jane@degage.be', name: 'Jane' },
      defaultViewers: [],
    });
    const plan = planRecipientSync(
      [
        {
          id: 1,
          email: CONTRACT_OWNER_PLACEHOLDER_EMAIL,
          name: 'Owner',
          role: 'SIGNER',
          signingOrder: 1,
        },
        {
          id: 2,
          email: 'john@degage.be',
          name: 'John',
          role: 'SIGNER',
          signingOrder: 2,
        },
        {
          id: 3,
          email: 'viewer@degage.be',
          name: 'Old Viewer',
          role: 'CC',
        },
      ],
      desired,
    );

    expect(plan.toDelete).toEqual(expect.arrayContaining([2, 3]));
    expect(plan.toCreate).toEqual([expect.objectContaining({ email: 'jane@degage.be', role: 'SIGNER' })]);
  });

  it('updates an existing recipient when name or role changes', () => {
    const desired = buildTemplateRecipients({
      defaultSignee: null,
      defaultViewers: [{ email: 'viewer@degage.be', name: 'New Name' }],
    });
    const plan = planRecipientSync(
      [
        {
          id: 1,
          email: CONTRACT_OWNER_PLACEHOLDER_EMAIL,
          name: 'Owner',
          role: 'SIGNER',
          signingOrder: 1,
        },
        {
          id: 4,
          email: 'viewer@degage.be',
          name: 'Old Name',
          role: 'CC',
        },
      ],
      desired,
    );

    expect(plan.toCreate).toEqual([]);
    expect(plan.toDelete).toEqual([]);
    expect(plan.toUpdate).toEqual([
      expect.objectContaining({
        id: 4,
        email: 'viewer@degage.be',
        name: 'New Name',
        role: 'CC',
      }),
    ]);
  });
});
