import type { DocumentType } from '@/domain/document.model';

export class DocumentNotRecognizedError extends Error {
  readonly documentType: DocumentType;

  constructor(documentType: DocumentType) {
    super(`The uploaded image could not be recognized as a ${documentType}`);
    this.name = 'DocumentNotRecognizedError';
    this.documentType = documentType;
  }
}
