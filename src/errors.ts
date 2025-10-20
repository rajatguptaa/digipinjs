export class DigiPinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DigiPinError';
  }
}

export class BoundsError extends DigiPinError {
  constructor(
    public readonly latitude: number | undefined,
    public readonly longitude: number | undefined,
    public readonly bounds: {
      minLat: number;
      maxLat: number;
      minLon: number;
      maxLon: number;
    }
  ) {
    super('Coordinates out of supported bounds');
    this.name = 'BoundsError';
  }
}

export class PinFormatError extends DigiPinError {
  constructor(public readonly pin: string) {
    super('Invalid DIGIPIN format');
    this.name = 'PinFormatError';
  }
}

export class InvalidCharacterError extends DigiPinError {
  constructor(public readonly character: string) {
    super(`Invalid DIGIPIN character: ${character}`);
    this.name = 'InvalidCharacterError';
  }
}

