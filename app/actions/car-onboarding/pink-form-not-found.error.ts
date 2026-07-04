export class PinkFormNotFoundError extends Error {
  constructor() {
    super('Pink form not found');
    this.name = 'PinkFormNotFoundError';
  }
}
