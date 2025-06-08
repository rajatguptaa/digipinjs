import { expect } from 'chai';
import { getCached, setCached } from '../cache';
import { getDigiPin } from '../core';

describe('Cache Functions', () => {
  beforeEach(() => {
    // Clear cache before each test
    // Note: In a real implementation, you might want to add a clear() method to the cache
  });

  it('should cache and retrieve values', () => {
    const lat = 28.6139;
    const lng = 77.2090;
    const pin = getDigiPin(lat, lng);
    
    // Initially not cached
    expect(getCached(lat, lng)).to.be.undefined;
    
    // Set cache
    setCached(lat, lng, pin);
    expect(getCached(lat, lng)).to.equal(pin);
  });

  it('should handle different coordinates', () => {
    const coords1 = { lat: 28.6139, lng: 77.2090 }; // Delhi
    const coords2 = { lat: 19.0760, lng: 72.8777 }; // Mumbai
    
    const pin1 = getDigiPin(coords1.lat, coords1.lng);
    const pin2 = getDigiPin(coords2.lat, coords2.lng);
    
    setCached(coords1.lat, coords1.lng, pin1);
    setCached(coords2.lat, coords2.lng, pin2);
    
    expect(getCached(coords1.lat, coords1.lng)).to.equal(pin1);
    expect(getCached(coords2.lat, coords2.lng)).to.equal(pin2);
  });

  it('should handle cache misses', () => {
    expect(getCached(0, 0)).to.be.undefined;
    expect(getCached(90, 180)).to.be.undefined;
  });

  it('should handle cache updates', () => {
    const lat = 28.6139;
    const lng = 77.2090;
    const pin1 = 'ABC-123-DEF';
    const pin2 = 'XYZ-789-UVW';
    
    setCached(lat, lng, pin1);
    expect(getCached(lat, lng)).to.equal(pin1);
    
    setCached(lat, lng, pin2);
    expect(getCached(lat, lng)).to.equal(pin2);
  });
}); 