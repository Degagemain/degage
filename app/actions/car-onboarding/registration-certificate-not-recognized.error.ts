export class RegistrationCertificateNotRecognizedError extends Error {
  constructor() {
    super('The uploaded image could not be recognized as a registration certificate front side');
    this.name = 'RegistrationCertificateNotRecognizedError';
  }
}
