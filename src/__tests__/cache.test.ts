import { expect } from 'chai';
import {
  getCachedEncode,
  setCachedEncode,
  getCachedDecode,
  setCachedDecode,
  clearCache,
} from '../cache';
import { getDigiPin, getLatLngFromDigiPin } from '../core';

describe('Cache Functions', () => {
  beforeEach(() => {
    clearCache();
  });

  it('caches encode results by coordinate and format', () => {
    const lat = 28.6139;
    const lng = 77.2090;
    const pin = getDigiPin(lat, lng, { format: 'hyphenated', useCache: false });

    expect(getCachedEncode(lat, lng, 'hyphenated')).to.be.undefined;
    setCachedEncode(lat, lng, pin, 'hyphenated');
    expect(getCachedEncode(lat, lng, 'hyphenated')).to.equal(pin);

    // different format stores independently
    const compact = getDigiPin(lat, lng, { format: 'compact', useCache: false });
    setCachedEncode(lat, lng, compact, 'compact');
    expect(getCachedEncode(lat, lng, 'compact')).to.equal(compact);
  });

  it('caches decode results by pin', () => {
    const pin = '39J-438-TJC7';
    const coords = getLatLngFromDigiPin(pin, { useCache: false });

    expect(getCachedDecode(pin)).to.be.undefined;
    setCachedDecode(pin, coords);
    expect(getCachedDecode(pin)).to.deep.equal(coords);
  });
});

