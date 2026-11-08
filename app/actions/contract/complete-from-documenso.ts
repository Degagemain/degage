import { type Contract, ContractStatus } from '@/domain/contract.model';
import { DocumentType } from '@/domain/document.model';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import {
  DocumensoNotConfiguredError as IntegrationNotConfiguredError,
  downloadCompletedEnvelopePdf,
  isDocumensoConfigured,
} from '@/integrations/documenso';
import { dbContractReadByDocumensoEnvelopeId } from '@/storage/contract/contract.read';
import { dbContractMarkSigned } from '@/storage/contract/contract.update';
import { DocumensoNotConfiguredError } from '@/actions/contract/contract.error';
import { logger } from '@/lib/logger';

export type DocumensoWebhookEvent = {
  event?: string;
  payload?: {
    envelopeId?: string;
    id?: number | string;
    status?: string;
    externalId?: string | null;
  };
};

export const completeContractFromDocumenso = async (event: DocumensoWebhookEvent): Promise<Contract | null> => {
  if (event.event !== 'DOCUMENT_COMPLETED') {
    return null;
  }

  const envelopeId = event.payload?.envelopeId;
  if (!envelopeId) {
    logger.warn('[documenso webhook] DOCUMENT_COMPLETED missing envelopeId');
    return null;
  }

  const contract = await dbContractReadByDocumensoEnvelopeId(envelopeId);
  if (!contract) {
    logger.warn('[documenso webhook] no contract for envelope', { envelopeId });
    return null;
  }

  if (contract.status === ContractStatus.Signed && contract.document) {
    return contract;
  }

  if (!isDocumensoConfigured()) {
    throw new DocumensoNotConfiguredError();
  }

  try {
    const { fileName, body } = await downloadCompletedEnvelopePdf(envelopeId);
    const document = await createDocumentWithUpload({
      type: DocumentType.CONTRACT,
      fileName,
      contentType: 'application/pdf',
      sizeBytes: body.byteLength,
      body,
    });
    return dbContractMarkSigned(contract.id!, document.id!);
  } catch (error) {
    if (error instanceof IntegrationNotConfiguredError) {
      throw new DocumensoNotConfiguredError();
    }
    throw error;
  }
};
