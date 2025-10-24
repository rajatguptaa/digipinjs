import LRU from 'lru-cache';
import type { DigiPinFormat } from './core';

export type Coordinates = { latitude: number; longitude: number };

const encodeCache = new LRU<string, string>({ max: 10_000 });
const decodeCache = new LRU<string, Coordinates>({ max: 10_000 });

function encodeKey(lat: number, lng: number, format: DigiPinFormat): string {
  return `${lat},${lng}:${format}`;
}

export function getCachedEncode(
  lat: number,
  lng: number,
  format: DigiPinFormat
): string | undefined {
  return encodeCache.get(encodeKey(lat, lng, format));
}

export function setCachedEncode(
  lat: number,
  lng: number,
  pin: string,
  format: DigiPinFormat
): void {
  encodeCache.set(encodeKey(lat, lng, format), pin);
}

export function getCachedDecode(pin: string): Coordinates | undefined {
  return decodeCache.get(pin);
}

export function setCachedDecode(pin: string, coordinates: Coordinates): void {
  decodeCache.set(pin, coordinates);
}

// Backwards compatible helpers (default hyphenated format)
export function getCached(lat: number, lng: number): string | undefined {
  return getCachedEncode(lat, lng, 'hyphenated');
}

export function setCached(lat: number, lng: number, pin: string): void {
  setCachedEncode(lat, lng, pin, 'hyphenated');
}

export function clearEncodeCache(): void {
  encodeCache.clear();
}

export function clearDecodeCache(): void {
  decodeCache.clear();
}

export function clearCache(): void {
  clearEncodeCache();
  clearDecodeCache();
}
