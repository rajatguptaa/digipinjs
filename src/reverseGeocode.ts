import { getLatLngFromDigiPin } from './core';
import { normalizeDigiPin } from './util';

export interface ReverseGeocodeResult {
  pin: string;
  latitude: number;
  longitude: number;
  label?: string;
  [extra: string]: unknown;
}

export type ReverseGeocodeResolver =
  | ((pin: string) => ReverseGeocodeResult | undefined)
  | ((pin: string) => Promise<ReverseGeocodeResult | undefined>);

let registeredResolver: ReverseGeocodeResolver | undefined;

export interface ReverseGeocodeOptions {
  resolver?: ReverseGeocodeResolver;
  fallbackToDecode?: boolean;
}

function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as Promise<T>).then === 'function'
  );
}

export function setReverseGeocodeResolver(resolver: ReverseGeocodeResolver): void {
  registeredResolver = resolver;
}

export function clearReverseGeocodeResolver(): void {
  registeredResolver = undefined;
}

function buildFallbackResult(pin: string): ReverseGeocodeResult {
  const coords = getLatLngFromDigiPin(pin);

  return {
    pin,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

export function reverseGeocode(
  pin: string,
  options: ReverseGeocodeOptions = {}
): ReverseGeocodeResult {
  const normalized = normalizeDigiPin(pin);
  const resolver = options.resolver ?? registeredResolver;
  const fallbackToDecode = options.fallbackToDecode ?? true;

  if (resolver) {
    const result = resolver(normalized);
    if (isPromise(result)) {
      throw new TypeError(
        'Reverse geocode resolver returned a Promise. Use reverseGeocodeAsync instead.'
      );
    }
    if (result) {
      return result;
    }
  }

  if (!fallbackToDecode) {
    throw new Error('No reverse geocode result available for the provided DIGIPIN');
  }

  return buildFallbackResult(normalized);
}

export async function reverseGeocodeAsync(
  pin: string,
  options: ReverseGeocodeOptions = {}
): Promise<ReverseGeocodeResult> {
  const normalized = normalizeDigiPin(pin);
  const resolver = options.resolver ?? registeredResolver;
  const fallbackToDecode = options.fallbackToDecode ?? true;

  if (resolver) {
    const result = resolver(normalized);
    if (isPromise<ReverseGeocodeResult | undefined>(result)) {
      const resolved = await result;
      if (resolved) {
        return resolved;
      }
    } else if (result) {
      return result;
    }
  }

  if (!fallbackToDecode) {
    throw new Error('No reverse geocode result available for the provided DIGIPIN');
  }

  return buildFallbackResult(normalized);
}

