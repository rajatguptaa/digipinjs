import { expect } from 'chai';
import { getDigiPin, getLatLngFromDigiPin } from '../core';

describe('DigiPin Core Functions', () => {
  describe('getDigiPin', () => {
    it('should encode valid coordinates to digipin', () => {
      // Test a known coordinate pair
      const lat = 28.6139; // Delhi
      const lng = 77.2090;
      const pin = getDigiPin(lat, lng);
      expect(pin).to.match(/^[FC98J327K456LMPT]{3}-[FC98J327K456LMPT]{3}-[FC98J327K456LMPT]{4}$/);
    });

    it('should throw error for out of bounds latitude', () => {
      expect(() => getDigiPin(1, 77.2090)).to.throw('Latitude out of range');
      expect(() => getDigiPin(40, 77.2090)).to.throw('Latitude out of range');
    });

    it('should throw error for out of bounds longitude', () => {
      expect(() => getDigiPin(28.6139, 60)).to.throw('Longitude out of range');
      expect(() => getDigiPin(28.6139, 100)).to.throw('Longitude out of range');
    });
  });

  describe('getLatLngFromDigiPin', () => {
    it('should decode valid digipin to coordinates', () => {
      const pin = 'K4P-9C6-LMPT';
      const result = getLatLngFromDigiPin(pin);
      expect(result).to.have.property('latitude');
      expect(result).to.have.property('longitude');
      expect(result.latitude).to.be.at.least(2.5);
      expect(result.latitude).to.be.at.most(38.5);
      expect(result.longitude).to.be.at.least(63.5);
      expect(result.longitude).to.be.at.most(99.5);
    });

    it('should throw error for invalid digipin length', () => {
      expect(() => getLatLngFromDigiPin('K4P-9C6')).to.throw('Invalid DIGIPIN');
      expect(() => getLatLngFromDigiPin('K4P-9C6-LMPT-EXTRA')).to.throw('Invalid DIGIPIN');
    });

    it('should throw error for invalid characters', () => {
      expect(() => getLatLngFromDigiPin('K4P-9C6-LMP1')).to.throw('Invalid character');
    });

    it('should roundtrip encode and decode', () => {
      const lat = 28.6139;
      const lng = 77.2090;
      const pin = getDigiPin(lat, lng);
      const result = getLatLngFromDigiPin(pin);
      
      // Allow for small floating point differences
      expect(Math.abs(result.latitude - lat)).to.be.lessThan(0.0001);
      expect(Math.abs(result.longitude - lng)).to.be.lessThan(0.0001);
    });
  });
}); 