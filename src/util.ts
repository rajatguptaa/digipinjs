import { InvalidCharacterError, PinFormatError } from './errors';

const ALLOWED_CHARS = new Set([
  'F', 'C', '9', '8',
  'J', '3', '2', '7',
  'K', '4', '5', '6',
  'L', 'M', 'P', 'T',
]);

/**
 * Validate a DIGIPIN and return it in normalized compact form (uppercase, no hyphen).
 */
export function normalizeDigiPin(pin: string): string {
  const cleaned = pin.replace(/-/g, '').trim().toUpperCase();

  if (cleaned.length !== 10) {
    throw new PinFormatError(pin);
  }

  for (const ch of cleaned) {
    if (!ALLOWED_CHARS.has(ch)) {
      throw new InvalidCharacterError(ch);
    }
  }

  return cleaned;
}

/**
 * Validate DIGIPIN without returning normalized value (legacy helper).
 * Returns void for backwards compatibility.
 */
export function digiPinValidator(pin: string): void {
  normalizeDigiPin(pin);
}

