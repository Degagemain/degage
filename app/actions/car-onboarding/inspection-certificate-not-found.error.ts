export class InspectionCertificateNotFoundError extends Error {
  constructor() {
    super('Inspection certificate not found');
    this.name = 'InspectionCertificateNotFoundError';
  }
}
