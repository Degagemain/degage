export class CarTaxOutOfCoverageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CarTaxOutOfCoverageError';
  }
}
