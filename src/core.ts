import { getCachedDecode, getCachedEncode, setCachedDecode, setCachedEncode } from './cache';
import { BoundsError, InvalidCharacterError, PinFormatError } from './errors';
import { normalizeDigiPin } from './util';

type Coordinate = { latitude: number; longitude: number };

interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

const DIGIPIN_GRID: readonly (readonly string[])[] = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T'],
] as const;

const BOUNDS: Bounds = { minLat: 2.5, maxLat: 38.5, minLon: 63.5, maxLon: 99.5 };

const CHAR_TO_COORD = new Map<string, { row: number; col: number }>();

for (let row = 0; row < DIGIPIN_GRID.length; row++) {
  for (let col = 0; col < DIGIPIN_GRID[row].length; col++) {
    CHAR_TO_COORD.set(DIGIPIN_GRID[row][col], { row, col });
  }
}

export type DigiPinFormat = 'hyphenated' | 'compact';

export interface EncodeOptions {
  format?: DigiPinFormat;
  roundTo?: number | 'none';
  useCache?: boolean;
}

export interface DecodeOptions {
  useCache?: boolean;
}

function ensureBounds(lat: number, lon: number): void {
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat || lon < BOUNDS.minLon || lon > BOUNDS.maxLon) {
    throw new BoundsError(lat, lon, BOUNDS);
  }
}

function formatPin(pin: string, format: DigiPinFormat): string {
  if (format === 'compact') {
    return pin.replace(/-/g, '');
  }
  const compact = pin.replace(/-/g, '');
  return `${compact.slice(0, 3)}-${compact.slice(3, 6)}-${compact.slice(6)}`;
}

function roundCoordinate(value: number, roundTo: number | 'none'): number {
  if (roundTo === 'none') {
    return value;
  }
  const decimals = typeof roundTo === 'number' ? roundTo : 6;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Encode latitude & longitude into DIGIPIN.
 */
export function getDigiPin(lat: number, lon: number, options: EncodeOptions = {}): string {
  const { format = 'hyphenated', roundTo = 6, useCache = true } = options;

  ensureBounds(lat, lon);

  const roundedLat = roundCoordinate(lat, roundTo);
  const roundedLon = roundCoordinate(lon, roundTo);

  if (useCache) {
    const cached = getCachedEncode(roundedLat, roundedLon, format);
    if (cached) {
      return cached;
    }
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let code = '';

  for (let level = 1; level <= 10; level++) {
    const latStep = (maxLat - minLat) / 4;
    const lonStep = (maxLon - minLon) / 4;
    let row = 3 - Math.floor((roundedLat - minLat) / latStep);
    let col = Math.floor((roundedLon - minLon) / lonStep);

    row = Math.min(3, Math.max(0, row));
    col = Math.min(3, Math.max(0, col));
    code += DIGIPIN_GRID[row][col];

    maxLat = minLat + latStep * (4 - row);
    minLat = minLat + latStep * (3 - row);
    minLon = minLon + lonStep * col;
    maxLon = minLon + lonStep;
  }

  const formatted = formatPin(code, format);

  if (useCache) {
    setCachedEncode(roundedLat, roundedLon, formatted, format);
  }

  return formatted;
}

/**
 * Decode DIGIPIN back to lat/lon center.
 */
export function getLatLngFromDigiPin(pin: string, options: DecodeOptions = {}): Coordinate {
  const { useCache = true } = options;
  const normalized = normalizeDigiPin(pin);

  if (useCache) {
    const cached = getCachedDecode(normalized);
    if (cached) {
      return cached;
    }
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  for (const char of normalized) {
    const coord = CHAR_TO_COORD.get(char);
    if (!coord) {
      throw new InvalidCharacterError(char);
    }

    const latStep = (maxLat - minLat) / 4;
    const lonStep = (maxLon - minLon) / 4;

    const newMaxLat = minLat + latStep * (4 - coord.row);
    const newMinLat = minLat + latStep * (3 - coord.row);
    const newMinLon = minLon + lonStep * coord.col;
    const newMaxLon = newMinLon + lonStep;

    minLat = newMinLat;
    maxLat = newMaxLat;
    minLon = newMinLon;
    maxLon = newMaxLon;
  }

  const result: Coordinate = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
  };

  if (useCache) {
    setCachedDecode(normalized, result);
  }

  return result;
}

export { BOUNDS };
