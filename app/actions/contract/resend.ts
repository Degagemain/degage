import { type Contract, ContractStatus } from '@/domain/contract.model';
import {
  ContractAlreadySignedError,
  ContractEnvelopeMissingError,
  ContractNotSentError,
  DocumensoNotConfiguredError,
} from '@/actions/contract/contract.error';
import {
  DocumensoNotConfiguredError as IntegrationNotConfiguredError,
  getEnvelope,
  isDocumensoConfigured,
  redistributeEnvelope,
} from '@/integrations/documenso';
import { dbContractRead } from '@/storage/contract/contract.read';

const isUnsignedActionRecipient = (recipient: { role: string; signingStatus?: string }): boolean => {
  if (recipient.role !== 'SIGNER' && recipient.role !== 'APPROVER') return false;
  const status = (recipient.signingStatus ?? '').toUpperCase();
  return status !== 'SIGNED' && status !== 'COMPLETED';
};

export const resendContract = async (id: string): Promise<Contract> => {
  if (!isDocumensoConfigured()) {
    throw new DocumensoNotConfiguredError();
  }

  const contract = await dbContractRead(id);
  if (contract.status === ContractStatus.Signed) {
    throw new ContractAlreadySignedError();
  }
  if (contract.status !== ContractStatus.Sent) {
    throw new ContractNotSentError();
  }
  if (!contract.documensoDocumentEnvelopeId) {
    throw new ContractEnvelopeMissingError();
  }

  try {
    const envelope = await getEnvelope(contract.documensoDocumentEnvelopeId);
    const recipientIds = (envelope.recipients ?? []).filter(isUnsignedActionRecipient).map((recipient) => recipient.id);
    await redistributeEnvelope(contract.documensoDocumentEnvelopeId, recipientIds);
    return contract;
  } catch (error) {
    if (error instanceof IntegrationNotConfiguredError) {
      throw new DocumensoNotConfiguredError();
    }
    throw error;
  }
};
