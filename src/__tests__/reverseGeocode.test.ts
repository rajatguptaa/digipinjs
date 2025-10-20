import { expect } from 'chai';
import {
  reverseGeocode,
  reverseGeocodeAsync,
  setReverseGeocodeResolver,
  clearReverseGeocodeResolver,
} from '../reverseGeocode';

describe('Reverse Geocode Helpers', () => {
  afterEach(() => {
    clearReverseGeocodeResolver();
  });

  it('falls back to coordinate decode when no resolver set', () => {
    const result = reverseGeocode('39J-438-TJC7');
    expect(result).to.include.keys(['pin', 'latitude', 'longitude']);
  });

  it('supports async resolver with override', async () => {
    setReverseGeocodeResolver(async (pin) => {
      if (pin === '39J438TJC7') {
        return {
          pin,
          latitude: 0,
          longitude: 0,
          label: 'Override',
        };
      }
      return undefined;
    });

    const result = await reverseGeocodeAsync('39J-438-TJC7');
    expect(result).to.deep.include({
      pin: '39J438TJC7',
      label: 'Override',
    });
  });
});

