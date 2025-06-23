import { getLatLngFromDigiPin } from './core';
import {
  getDistance as getCoordinateDistance,
  getPreciseDistance as getPreciseCoordinateDistance,
} from 'geolib';
import { digiPinValidator } from './util';

export function getDistance(
  startPin: string,
  endPin: string,
  accuracy = 1
): number {
  digiPinValidator(startPin);
  digiPinValidator(endPin);

  const start = getLatLngFromDigiPin(startPin);
  const end = getLatLngFromDigiPin(endPin);

  return getCoordinateDistance(start, end, accuracy);
}

export function getPreciseDistance(
  startPin: string,
  endPin: string,
  accuracy = 1
): number {
  digiPinValidator(startPin);
  digiPinValidator(endPin);

  const start = getLatLngFromDigiPin(startPin);
  const end = getLatLngFromDigiPin(endPin);

  return getPreciseCoordinateDistance(start, end, accuracy);
}

export function orderByDistance(
  referencePin: string,
  pins: string[],
  distanceFn: (startPin: string, endPin: string) => number = getDistance
) {
  digiPinValidator(referencePin);
  pins.forEach((p) => digiPinValidator(p));

  return pins
    .slice()
    .sort((a, b) => distanceFn(referencePin, a) - distanceFn(referencePin, b));
}

export function findNearest(referencePin: string, pins: string[]) {
  digiPinValidator(referencePin);
  pins.forEach((p) => digiPinValidator(p));

  return orderByDistance(referencePin, pins)[0];
}
