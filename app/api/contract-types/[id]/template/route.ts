import type { NextRequest } from 'next/server';
import { createContractTypeTemplate } from '@/actions/contract-type/create-template';
import { readContractType } from '@/actions/contract-type/read';
import { getDocumensoTemplateEditorUrl } from '@/integrations/documenso';
import { type IdRouteParams, getIdFromRoute, responseFromCaughtError } from '@/api/utils';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';
import { statusCodes } from '@/api/status-codes';
import { getMaxUploadFileSizeBytes } from '@/lib/max-upload-file-size';

export const GET = withAdmin(async (_request, context) => {
  try {
    const id = await getIdFromRoute(context as IdRouteParams);
    const contractType = await readContractType(id);
    const editorUrl = contractType.documensoTemplateEnvelopeId ? getDocumensoTemplateEditorUrl(contractType.documensoTemplateEnvelopeId) : null;
    return Response.json({ editorUrl });
  } catch (error) {
    const mapped = responseFromCaughtError(error);
    if (mapped) return mapped;
    logger.exception(error, { helper: 'contract-types/[id]/template GET' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});

export const POST = withAdmin(async (request: NextRequest, context) => {
  try {
    const id = await getIdFromRoute(context as IdRouteParams);
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return Response.json({ code: 'validation_error', errors: [{ message: 'file is required' }] }, { status: statusCodes.BAD_REQUEST });
    }

    if (file.type !== 'application/pdf') {
      return Response.json(
        { code: 'validation_error', errors: [{ message: 'Only PDF files are supported' }] },
        { status: statusCodes.BAD_REQUEST },
      );
    }

    const maxSizeBytes = getMaxUploadFileSizeBytes();
    if (file.size <= 0 || file.size > maxSizeBytes) {
      return Response.json({ code: 'validation_error', errors: [{ message: 'Invalid file size' }] }, { status: statusCodes.BAD_REQUEST });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await createContractTypeTemplate({
      contractTypeId: id,
      fileName: file.name || 'template.pdf',
      pdf: buffer,
    });

    return Response.json(result, { status: statusCodes.CREATED });
  } catch (error) {
    const mapped = responseFromCaughtError(error);
    if (mapped) return mapped;
    logger.exception(error, { helper: 'contract-types/[id]/template POST' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
