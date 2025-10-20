import readline from 'readline';
import { getDigiPin, getLatLngFromDigiPin, type DecodeOptions, type EncodeOptions } from './core';
import { normalizeDigiPin } from './util';

export type WatchInputFormat = 'json' | 'csv';

export interface EncodeWatchResult {
  raw: string;
  lat: number;
  lng: number;
  pin: string;
}

export interface DecodeWatchResult {
  raw: string;
  pin: string;
  latitude: number;
  longitude: number;
}

export interface EncodeWatchOptions extends EncodeOptions {
  inputFormat?: WatchInputFormat;
  onResult: (result: EncodeWatchResult) => void;
  onError?: (error: Error, raw: string) => void;
}

export interface DecodeWatchOptions extends DecodeOptions {
  onResult: (result: DecodeWatchResult) => void;
  onError?: (error: Error, raw: string) => void;
}

function parseCoordinateLine(
  line: string,
  format: WatchInputFormat
): { lat: number; lng: number } {
  if (format === 'csv') {
    const [latStr, lngStr] = line.split(',').map((value) => value.trim());
    if (!latStr || !lngStr) {
      throw new Error('Expected "lat,lng" comma separated values');
    }
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error('Unable to parse coordinates from CSV input');
    }
    return { lat, lng };
  }

  const parsed = JSON.parse(line);
  const lat = parsed.lat ?? parsed.latitude;
  const lng = parsed.lng ?? parsed.longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('JSON input must contain numeric lat/lng or latitude/longitude fields');
  }
  return { lat, lng };
}

export function watchEncodeStream(
  input: NodeJS.ReadableStream,
  options: EncodeWatchOptions
): readline.Interface {
  const format = options.inputFormat ?? 'json';
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  rl.on('line', (line: string) => {
    const raw = line.trim();
    if (!raw) {
      return;
    }
    try {
      const { lat, lng } = parseCoordinateLine(raw, format);
      const pin = getDigiPin(lat, lng, options);
      options.onResult({ raw, lat, lng, pin });
    } catch (error) {
      options.onError?.(error as Error, raw);
    }
  });

  return rl;
}

export function watchDecodeStream(
  input: NodeJS.ReadableStream,
  options: DecodeWatchOptions
): readline.Interface {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  rl.on('line', (line: string) => {
    const raw = line.trim();
    if (!raw) {
      return;
    }
    try {
      const normalized = normalizeDigiPin(raw);
      const coords = getLatLngFromDigiPin(normalized, options);
      options.onResult({
        raw,
        pin: normalized,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      options.onError?.(error as Error, raw);
    }
  });

  return rl;
}

