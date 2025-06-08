import { getDigiPin, getLatLngFromDigiPin } from './core';

export function batchEncode(coords: { lat: number; lng: number }[]): string[] {
  return coords.map(c => getDigiPin(c.lat, c.lng));
}

export function batchDecode(pins: string[]): { latitude: number; longitude: number }[] {
  return pins.map(getLatLngFromDigiPin);
}