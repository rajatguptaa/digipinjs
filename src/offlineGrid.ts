import fs from 'fs';
import { getDigiPin, type EncodeOptions } from './core';

export type GridOutputFormat = 'json' | 'ndjson';

export interface GenerateGridOptions extends EncodeOptions {
  outputFormat?: GridOutputFormat;
  pretty?: boolean;
}

function assertStep(step: number): void {
  if (step <= 0) {
    throw new RangeError('Step must be greater than zero');
  }
}

function assertBounds(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): void {
  if (minLat > maxLat) {
    throw new RangeError('minLat must be less than or equal to maxLat');
  }
  if (minLng > maxLng) {
    throw new RangeError('minLng must be less than or equal to maxLng');
  }
}

function* iterateGrid(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  step: number
): Generator<{ lat: number; lon: number }> {
  for (let lat = minLat; lat <= maxLat + 1e-9; lat += step) {
    for (let lon = minLng; lon <= maxLng + 1e-9; lon += step) {
      yield { lat, lon };
    }
  }
}

export function generateGrid(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number,
  step: number,
  outFile: string,
  options: GenerateGridOptions = {}
): void {
  assertStep(step);
  assertBounds(minLat, maxLat, minLng, maxLng);

  const { outputFormat = 'ndjson', pretty = false, ...encodeOptions } = options;

  const fileDescriptor = fs.openSync(outFile, 'w');

  if (outputFormat === 'json') {
    fs.writeSync(fileDescriptor, '{\n');
  }

  let firstEntry = true;

  for (const { lat, lon } of iterateGrid(minLat, maxLat, minLng, maxLng, step)) {
    const pin = getDigiPin(lat, lon, encodeOptions);
    const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    const payload = JSON.stringify({ key, pin });

    if (outputFormat === 'ndjson') {
      fs.writeSync(fileDescriptor, payload);
      fs.writeSync(fileDescriptor, '\n');
      continue;
    }

    if (!firstEntry) {
      fs.writeSync(fileDescriptor, ',\n');
    }
    const record = pretty
      ? `  "${key}": ${JSON.stringify(pin)}`
      : `"${key}":${JSON.stringify(pin)}`;
    fs.writeSync(fileDescriptor, record);
    firstEntry = false;
  }

  if (outputFormat === 'json') {
    if (!firstEntry && pretty) {
      fs.writeSync(fileDescriptor, '\n');
    }
    fs.writeSync(fileDescriptor, '}\n');
  }

  fs.closeSync(fileDescriptor);
}
