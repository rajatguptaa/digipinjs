import { getLatLngFromDigiPin } from './core';

export function reverseGeocode(pin: string): { latitude: number; longitude: number } {
  return getLatLngFromDigiPin(pin);
}

