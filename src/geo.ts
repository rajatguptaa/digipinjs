import {
  getLatLngFromDigiPin,
  type DecodeOptions,
} from './core';
import {
  getDistance as getCoordinateDistance,
  getPreciseDistance as getPreciseCoordinateDistance,
} from 'geolib';
import type { Coordinates } from './cache';
import { normalizeDigiPin } from './util';

export type PinInput = string | Coordinates;

function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const maybe = value as Partial<Coordinates>;
  return (
    typeof maybe.latitude === 'number' &&
    typeof maybe.longitude === 'number'
  );
}

function resolveCoordinates(
  input: PinInput,
  decodeOptions: DecodeOptions = {}
): Coordinates {
  if (typeof input === 'string') {
    return getLatLngFromDigiPin(input, decodeOptions);
  }
  if (isCoordinates(input)) {
    return input;
  }
  throw new TypeError('Unsupported pin input');
}

export function getDistance(
  start: PinInput,
  end: PinInput,
  accuracy = 1,
  decodeOptions: DecodeOptions = {}
): number {
  if (typeof start === 'string') {
    normalizeDigiPin(start);
  }
  if (typeof end === 'string') {
    normalizeDigiPin(end);
  }

  const startCoords = resolveCoordinates(start, decodeOptions);
  const endCoords = resolveCoordinates(end, decodeOptions);

  return getCoordinateDistance(startCoords, endCoords, accuracy);
}

export function getPreciseDistance(
  start: PinInput,
  end: PinInput,
  accuracy = 1,
  decodeOptions: DecodeOptions = {}
): number {
  if (typeof start === 'string') {
    normalizeDigiPin(start);
  }
  if (typeof end === 'string') {
    normalizeDigiPin(end);
  }

  const startCoords = resolveCoordinates(start, decodeOptions);
  const endCoords = resolveCoordinates(end, decodeOptions);

  return getPreciseCoordinateDistance(startCoords, endCoords, accuracy);
}

export interface DistanceOrderOptions {
  accuracy?: number;
  decodeOptions?: DecodeOptions;
  distanceFn?: (start: Coordinates, end: Coordinates) => number;
}

export function orderByDistance<T extends PinInput>(
  reference: PinInput,
  pins: readonly T[],
  options: DistanceOrderOptions = {}
): T[] {
  const {
    accuracy = 1,
    decodeOptions = {},
    distanceFn = (start: Coordinates, end: Coordinates) =>
      getCoordinateDistance(start, end, accuracy),
  } = options;

  if (typeof reference === 'string') {
    normalizeDigiPin(reference);
  }

  const referenceCoords = resolveCoordinates(reference, decodeOptions);

  return pins
    .map((pin) => ({
      pin,
      coords: resolveCoordinates(pin, decodeOptions),
    }))
    .sort((a, b) => distanceFn(referenceCoords, a.coords) - distanceFn(referenceCoords, b.coords))
    .map(({ pin }) => pin);
}

export interface NearestOptions extends DistanceOrderOptions {}

export function findNearest<T extends PinInput>(
  reference: PinInput,
  pins: readonly T[],
  options: NearestOptions = {}
): T | undefined {
  if (pins.length === 0) {
    return undefined;
  }

  return orderByDistance(reference, pins, options)[0];
}

