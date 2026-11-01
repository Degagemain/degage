import { type ContractType, contractTypeSchema } from '@/domain/contract-type.model';
import { DocumensoNotConfiguredError } from '@/actions/contract/contract.error';
import { haveContractTypeRecipientsChanged, resolveContractTypeTemplateRecipients } from '@/actions/contract-type/resolve-template-recipients';
import {
  DocumensoNotConfiguredError as IntegrationNotConfiguredError,
  isDocumensoConfigured,
  syncEnvelopeRecipients,
} from '@/integrations/documenso';
import { dbContractTypeRead } from '@/storage/contract-type/contract-type.read';
import { dbContractTypeUpdate } from '@/storage/contract-type/contract-type.update';

export const updateContractType = async (contractType: ContractType): Promise<ContractType> => {
  const existing = await dbContractTypeRead(contractType.id!);
  const validated = contractTypeSchema.parse({
    ...contractType,
    documensoTemplateEnvelopeId: existing.documensoTemplateEnvelopeId,
  });

  const recipientsChanged = haveContractTypeRecipientsChanged(existing, validated);
  if (recipientsChanged && existing.documensoTemplateEnvelopeId) {
    if (!isDocumensoConfigured()) {
      throw new DocumensoNotConfiguredError();
    }
    try {
      const desired = await resolveContractTypeTemplateRecipients(validated);
      await syncEnvelopeRecipients(existing.documensoTemplateEnvelopeId, desired);
    } catch (error) {
      if (error instanceof IntegrationNotConfiguredError) {
        throw new DocumensoNotConfiguredError();
      }
      throw error;
    }
  }

  return dbContractTypeUpdate(validated);
};
