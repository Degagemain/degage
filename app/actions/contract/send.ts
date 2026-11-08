import { type Contract, ContractStatus } from '@/domain/contract.model';
import { ContractNotDraftError, ContractTemplateMissingError, DocumensoNotConfiguredError } from '@/actions/contract/contract.error';
import {
  DocumensoNotConfiguredError as IntegrationNotConfiguredError,
  createDocumentFromTemplate,
  getEnvelope,
  isDocumensoConfigured,
  mapTemplateRecipientsForOwner,
} from '@/integrations/documenso';
import { dbContractRead } from '@/storage/contract/contract.read';
import { dbContractMarkSent } from '@/storage/contract/contract.update';
import { dbContractTypeRead } from '@/storage/contract-type/contract-type.read';
import { dbUserRead } from '@/storage/user/user.read';

export const sendContract = async (id: string): Promise<Contract> => {
  if (!isDocumensoConfigured()) {
    throw new DocumensoNotConfiguredError();
  }

  const contract = await dbContractRead(id);
  if (contract.status !== ContractStatus.Draft) {
    throw new ContractNotDraftError();
  }

  const contractType = await dbContractTypeRead(contract.type.id);
  if (!contractType.documensoTemplateEnvelopeId) {
    throw new ContractTemplateMissingError();
  }

  const owner = await dbUserRead(contract.user.id);

  try {
    const template = await getEnvelope(contractType.documensoTemplateEnvelopeId);
    const recipients = mapTemplateRecipientsForOwner(template.recipients ?? [], {
      email: owner.email,
      name: owner.name,
    });

    const document = await createDocumentFromTemplate({
      templateEnvelopeId: contractType.documensoTemplateEnvelopeId,
      externalId: contract.id!,
      recipients,
      distributeDocument: true,
    });

    return dbContractMarkSent(contract.id!, document.id);
  } catch (error) {
    if (error instanceof IntegrationNotConfiguredError) {
      throw new DocumensoNotConfiguredError();
    }
    throw error;
  }
};
