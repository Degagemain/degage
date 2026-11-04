import {
  DocumensoNotConfiguredError as IntegrationNotConfiguredError,
  createTemplateEnvelope,
  getDocumensoTemplateEditorUrl,
  isDocumensoConfigured,
} from '@/integrations/documenso';
import { resolveContractTypeTemplateRecipients } from '@/actions/contract-type/resolve-template-recipients';
import { dbContractTypeRead } from '@/storage/contract-type/contract-type.read';
import { dbContractTypeUpdateTemplateEnvelopeId } from '@/storage/contract-type/contract-type.update';
import { DocumensoNotConfiguredError } from '@/actions/contract/contract.error';
import type { ContractType } from '@/domain/contract-type.model';

export type CreateContractTypeTemplateInput = {
  contractTypeId: string;
  fileName: string;
  pdf: Buffer;
};

export type CreateContractTypeTemplateResult = {
  contractType: ContractType;
  editorUrl: string | null;
};

export const createContractTypeTemplate = async (input: CreateContractTypeTemplateInput): Promise<CreateContractTypeTemplateResult> => {
  if (!isDocumensoConfigured()) {
    throw new DocumensoNotConfiguredError();
  }

  const contractType = await dbContractTypeRead(input.contractTypeId);
  const recipients = await resolveContractTypeTemplateRecipients(contractType);

  try {
    const created = await createTemplateEnvelope({
      title: contractType.code,
      externalId: `contract-type:${contractType.id}`,
      pdf: input.pdf,
      fileName: input.fileName,
      recipients,
    });

    const updated = await dbContractTypeUpdateTemplateEnvelopeId(contractType.id!, created.id);
    return {
      contractType: updated,
      editorUrl: getDocumensoTemplateEditorUrl(created.id),
    };
  } catch (error) {
    if (error instanceof IntegrationNotConfiguredError) {
      throw new DocumensoNotConfiguredError();
    }
    throw error;
  }
};
