import { expect } from 'chai';
import {
  getDistance,
  getPreciseDistance,
  orderByDistance,
  findNearest,
} from '../geo';

// Distance Validator tools
// https://dac.indiapost.gov.in/mydigipin/home
// https://www.gps-coordinates.net/distance

describe('DigiPin Geo Functions', () => {
  describe('getDistance', () => {
    it('should return distance between two geoCodes', () => {
      const start = '422-35T-M8JT'; //AIG Hospital Hyd
      const end = '422-36L-P6J9'; //Raidurg Metro Hyd
      const result = getDistance(start, end);

      expect(result).to.equal(1168);
    });
  });

  describe('getPreciseDistance', () => {
    it('should return precise distance between two geoCodes', () => {
      const start = '422-35T-M8JT'; //AIG Hospital Hyd
      const end = '422-36L-P6J9'; //Raidurg Metro Hyd
      const result = getPreciseDistance(start, end);

      expect(result).to.equal(1169);
    });
  });

  describe('orderByDistance', () => {
    it('should return geoCodes in sorted order', () => {
      const start = '422-35T-M8JT'; //AIG Hospital Hyd

      const ends = [
        '422-363-53LJ', //Yashoda Hospitals Hitech City Hyd (Second)
        '422-36L-P6J9', //Raidurg Metro Hyd (First)
      ];
      const result = orderByDistance(start, ends);

      expect(result).to.deep.equal(['422-36L-P6J9', '422-363-53LJ']);
    });
  });

  describe('findNearest', () => {
    it('should return geoCodes in nearest geoCode', () => {
      const start = '422-35T-M8JT'; //AIG Hospital Hyd

      const ends = [
        '422-363-53LJ', //Yashoda Hospitals Hitech City Hyd (Second)
        '422-36L-P6J9', //Raidurg Metro Hyd (First)
      ];
      const result = findNearest(start, ends);

      expect(result).to.deep.equal('422-36L-P6J9');
    });
  });
});
