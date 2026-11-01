import { AppError } from '@/actions/app.error';

export class ContractNotDraftError extends AppError {
  constructor(message = 'Only draft contracts can be modified or sent') {
    super('contract_not_draft', message, 409);
  }
}

export class ContractTemplateMissingError extends AppError {
  constructor(message = 'Contract type has no Documenso template') {
    super('contract_template_missing', message, 400);
  }
}

export class DocumensoNotConfiguredError extends AppError {
  constructor() {
    super('documenso_not_configured', 'Documenso is not configured', 503);
  }
}

export class ContractDocumentMissingError extends AppError {
  constructor(message = 'Signed contract document is not available') {
    super('contract_document_missing', message, 404);
  }
}
