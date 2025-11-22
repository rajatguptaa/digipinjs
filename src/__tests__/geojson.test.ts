import { expect } from 'chai';
import { toGeoJson } from '../geojson';

describe('GeoJSON Utilities', () => {
    it('converts DIGIPIN to GeoJSON Point Feature', () => {
        const pin = '39J-438-TJC7'; // Delhi
        const feature = toGeoJson(pin);

        expect(feature.type).to.equal('Feature');
        expect(feature.geometry.type).to.equal('Point');
        expect(feature.geometry.coordinates).to.have.length(2);
        expect(feature.geometry.coordinates[0]).to.be.closeTo(77.2090, 0.0001); // Lng
        expect(feature.geometry.coordinates[1]).to.be.closeTo(28.6139, 0.0001); // Lat
        expect(feature.properties.pin).to.equal('39J438TJC7');
    });

    it('includes custom properties', () => {
        const feature = toGeoJson('39J-438-TJC7', { name: 'Delhi' });
        expect(feature.properties.name).to.equal('Delhi');
    });
});
