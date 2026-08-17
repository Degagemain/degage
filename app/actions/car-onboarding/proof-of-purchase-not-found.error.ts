export class ProofOfPurchaseNotFoundError extends Error {
  constructor() {
    super('Proof of purchase not found');
    this.name = 'ProofOfPurchaseNotFoundError';
  }
}
