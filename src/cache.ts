import LRU from 'lru-cache';

const cache = new LRU<string, string>({ max: 10000 });

export function getCached(lat: number, lng: number): string | undefined {
  return cache.get(`${lat},${lng}`);
}

export function setCached(lat: number, lng: number, pin: string): void {
  cache.set(`${lat},${lng}`, pin);
}

export function clearCache(): void {
  cache.clear();
}

// src/reverseGeocode.ts
import { getLatLngFromDigiPin } from './core';

export function reverseGeocode(pin: string): { latitude: number; longitude: number } {
  return getLatLngFromDigiPin(pin);
}
