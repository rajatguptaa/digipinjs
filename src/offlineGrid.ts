import fs from 'fs';
import { getDigiPin } from './core';

export function generateGrid(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number,
  step: number,
  outFile: string
) {
  const grid: Record<string, string> = {};
  for (let lat = minLat; lat <= maxLat; lat += step) {
    for (let lon = minLng; lon <= maxLng; lon += step) {
      grid[`${lat.toFixed(6)},${lon.toFixed(6)}`] = getDigiPin(lat, lon);
    }
  }
  fs.writeFileSync(outFile, JSON.stringify(grid, null, 2));
}