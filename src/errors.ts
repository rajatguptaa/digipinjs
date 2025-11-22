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
  constructor(char: string) {
    const suggestion = getSuggestion(char);
    const message = suggestion
      ? `Invalid character '${char}' in DIGIPIN. Did you mean '${suggestion}'?`
      : `Invalid character '${char}' in DIGIPIN`;
    super(message);
    this.name = 'InvalidCharacterError';
  }
}

function getSuggestion(char: string): string | null {
  const map: Record<string, string> = {
    '0': 'C', // 0 looks like C or O (not used)
    '1': 'J', // 1 looks like J or I (not used)
    'O': '0', // O is not used, maybe 0? (also not used, but C is close)
    'I': 'J', // I is not used
    'Q': '9',
    'Z': '2',
    'S': '5',
    'B': '8',
    'G': '6',
  };
  return map[char.toUpperCase()] || null;
}
