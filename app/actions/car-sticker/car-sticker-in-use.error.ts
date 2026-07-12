export class CarStickerInUseError extends Error {
  constructor() {
    super('Car sticker is linked to one or more car onboardings and cannot be deleted');
    this.name = 'CarStickerInUseError';
  }
}
