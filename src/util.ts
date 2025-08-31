const ALLOWED_CHARS = new Set([
  'F','C','9','8',
  'J','3','2','7',
  'K','4','5','6',
  'L','M','P','T'
]);

export function digiPinValidator(pin: string): void {
  // Allow both hyphenated (XXX-XXX-XXXX) and non-hyphenated (XXXXXXXXXX)
  const cleaned = pin.replace(/-/g, '');

  if (cleaned.length !== 10) {
    throw new Error('Invalid DIGIPIN');
  }

  for (const ch of cleaned) {
    if (!ALLOWED_CHARS.has(ch)) {
      throw new Error('Invalid character');
    }
  }
}
