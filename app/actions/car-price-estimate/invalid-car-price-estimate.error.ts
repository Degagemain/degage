export class InvalidCarPriceEstimateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCarPriceEstimateError';
  }
}
