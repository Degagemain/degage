import { ContractStatus } from '@/domain/contract.model';
import { ContractDocumentMissingError } from '@/actions/contract/contract.error';
import { dbContractRead } from '@/storage/contract/contract.read';
import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';

export const getContractDocumentViewUrl = async (id: string): Promise<string> => {
  const contract = await dbContractRead(id);
  if (contract.status !== ContractStatus.Signed || !contract.document?.id) {
    throw new ContractDocumentMissingError();
  }
  return dbDocumentGetSignedViewUrl(contract.document.id);
};
