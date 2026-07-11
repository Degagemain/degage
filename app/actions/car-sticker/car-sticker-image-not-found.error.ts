export class CarStickerImageNotFoundError extends Error {
  constructor() {
    super('Car sticker image not found');
    this.name = 'CarStickerImageNotFoundError';
  }
}
