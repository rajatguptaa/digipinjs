import { expect } from 'chai';
import {
  getDigiPin,
  getLatLngFromDigiPin,
  BOUNDS,
  type EncodeOptions,
} from '../core';

const defaultEncodeOptions: EncodeOptions = {
  format: 'hyphenated',
  roundTo: 6,
  useCache: false,
};

describe('DigiPIN core encode/decode', () => {
  it('encodes known coordinates', () => {
    const pin = getDigiPin(28.6139, 77.209, defaultEncodeOptions);
    expect(pin).to.equal('39J-438-TJC7');
  });

  it('decodes known DIGIPIN', () => {
    const coords = getLatLngFromDigiPin('39J-438-TJC7', { useCache: false });
    expect(coords.latitude).to.be.closeTo(28.6139, 0.1);
    expect(coords.longitude).to.be.closeTo(77.209, 0.1);
  });

  it('round trips through encode -> decode -> encode', () => {
    const randomInRange = (min: number, max: number): number =>
      min + Math.random() * (max - min);

    for (let i = 0; i < 200; i++) {
      const lat = randomInRange(BOUNDS.minLat, BOUNDS.maxLat);
      const lon = randomInRange(BOUNDS.minLon, BOUNDS.maxLon);
      const pin = getDigiPin(lat, lon, defaultEncodeOptions);
      const decoded = getLatLngFromDigiPin(pin, { useCache: false });
      const reencoded = getDigiPin(decoded.latitude, decoded.longitude, defaultEncodeOptions);
      expect(reencoded).to.equal(pin);
    }
  });
});
