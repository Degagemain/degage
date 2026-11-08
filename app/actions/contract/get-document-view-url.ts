import { ContractDocumentMissingError } from '@/actions/contract/contract.error';
import { ContractStatus } from '@/domain/contract.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { dbContractRead } from '@/storage/contract/contract.read';
import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';
import { AppError } from '@/actions/app.error';

export class ContractDocumentForbiddenError extends AppError {
  constructor(message = 'Not allowed to view this contract document') {
    super('contract_document_forbidden', message, 403);
  }
}

export const getContractDocumentViewUrl = async (id: string, caller?: UserWithRole): Promise<string> => {
  const contract = await dbContractRead(id);
  if (caller != null && !isAdmin(caller) && contract.user.id !== caller.id) {
    throw new ContractDocumentForbiddenError();
  }
  if (contract.status !== ContractStatus.Signed || !contract.document?.id) {
    throw new ContractDocumentMissingError();
  }
  return dbDocumentGetSignedViewUrl(contract.document.id);
};
