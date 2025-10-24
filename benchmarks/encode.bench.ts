import { performance } from 'perf_hooks';
import { getDigiPin, getLatLngFromDigiPin, type EncodeOptions } from '../src/core';

const ITERATIONS = 100_000;

const encodeOptions: EncodeOptions = {
  format: 'hyphenated',
  roundTo: 6,
};

function measure(label: string, fn: () => void) {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    fn();
  }
  const total = performance.now() - start;
  const perCall = total / ITERATIONS;
  return { label, perCall, opsPerSec: 1000 / perCall };
}

function runBench(): void {
  const results = [
    measure('encode (Delhi)', () => {
      getDigiPin(28.6139, 77.209, encodeOptions);
    }),
    measure('encode (Mumbai)', () => {
      getDigiPin(19.076, 72.8777, encodeOptions);
    }),
    measure('decode (Delhi)', () => {
      getLatLngFromDigiPin('39J-438-TJC7');
    }),
  ];

  console.table(
    results.map((result) => ({
      Operation: result.label,
      'Avg ms/op': result.perCall.toFixed(6),
      'Ops/sec': result.opsPerSec.toFixed(2),
    }))
  );
}

runBench();
