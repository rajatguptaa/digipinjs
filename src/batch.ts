import { getDigiPin, getLatLngFromDigiPin, type DecodeOptions, type EncodeOptions } from './core';

export function batchEncode(
  coords: { lat: number; lng: number }[],
  options: EncodeOptions = {}
): string[] {
  return coords.map((c) => getDigiPin(c.lat, c.lng, options));
}

export function batchDecode(
  pins: string[],
  options: DecodeOptions = {}
): { latitude: number; longitude: number }[] {
  return pins.map((pin) => getLatLngFromDigiPin(pin, options));
}

