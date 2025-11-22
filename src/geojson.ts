import { getLatLngFromDigiPin, type DecodeOptions } from './core';
import { normalizeDigiPin } from './util';

export interface GeoJsonPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJsonFeature {
    type: 'Feature';
    geometry: GeoJsonPoint;
    properties: {
        pin: string;
        [key: string]: unknown;
    };
}

/**
 * Convert a DIGIPIN to a GeoJSON Point Feature.
 * @param pin The DIGIPIN string.
 * @param properties Optional additional properties for the feature.
 * @param options Decode options (caching).
 */
export function toGeoJson(
    pin: string,
    properties: Record<string, unknown> = {},
    options: DecodeOptions = {}
): GeoJsonFeature {
    const normalized = normalizeDigiPin(pin);
    const { latitude, longitude } = getLatLngFromDigiPin(normalized, options);

    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
        },
        properties: {
            ...properties,
            pin: normalized,
        },
    };
}
