export class RegistrationCertificateNotFoundError extends Error {
  constructor() {
    super('Registration certificate not found');
    this.name = 'RegistrationCertificateNotFoundError';
  }
}
