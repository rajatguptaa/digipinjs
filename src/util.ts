export function digiPinValidator(pin: string) {
  if (pin.length > 12) {
    throw 'Invalid DIGIPIN';
  }
}
