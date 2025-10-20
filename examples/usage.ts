const express = require('express');
const {
  getDigiPin,
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  getCachedEncode,
  setCachedEncode,
  reverseGeocode,
} = require('../dist/cjs');
const { digiPinMiddleware } = require('../dist/cjs/node');

// 1. Basic Usage
console.log('\n1. Basic Usage:');
const lat = 28.6139; // Delhi
const lng = 77.2090;
const pin = getDigiPin(lat, lng);
console.log(`Coordinates (${lat}, ${lng}) -> DigiPIN: ${pin}`);
const decoded = getLatLngFromDigiPin(pin);
console.log(`DigiPIN ${pin} -> Coordinates: (${decoded.latitude}, ${decoded.longitude})`);

// 2. Batch Processing
console.log('\n2. Batch Processing:');
const coordinates = [
  { lat: 28.6139, lng: 77.2090 }, // Delhi
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 12.9716, lng: 77.5946 }  // Bangalore
];
const pins = batchEncode(coordinates);
console.log('Batch Encode:', pins);
const decodedCoords = batchDecode(pins);
console.log('Batch Decode:', decodedCoords);

// 3. Caching Example
console.log('\n3. Caching:');
const cachedBefore = getCachedEncode(lat, lng, 'hyphenated');
console.log('Initial cache lookup:', cachedBefore);
if (!cachedBefore) {
  setCachedEncode(lat, lng, pin, 'hyphenated');
}
const cachedAfter = getCachedEncode(lat, lng, 'hyphenated');
console.log('Cached value:', cachedAfter);

// 4. Reverse Geocoding
console.log('\n4. Reverse Geocoding:');
const decodedLocation = reverseGeocode(pin);
console.log(`DigiPIN ${pin} -> Location:`, decodedLocation);

// 5. Express Middleware Example
console.log('\n5. Express Middleware Example:');
const app = express();
app.use(digiPinMiddleware());

// Example route that uses the middleware
app.get('/location', (req, res) => {
  const digiPin = req.header('X-DIGIPIN');
  if (!digiPin) {
    return res.status(400).json({ error: 'No coordinates provided' });
  }

  try {
    const coordinates = getLatLngFromDigiPin(digiPin);
    res.json({ digiPin, ...coordinates });
  } catch (error) {
    res.status(400).json({ error: 'Invalid DigiPIN' });
  }
});

// Example route that generates a DigiPIN
app.get('/generate', (req, res) => {
  const lat = parseFloat(req.query.lat || '');
  const lng = parseFloat(req.query.lng || '');

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    const digiPin = getDigiPin(lat, lng);
    res.json({ digiPin, latitude: lat, longitude: lng });
  } catch (error) {
    res.status(400).json({ error: 'Invalid coordinates' });
  }
});

// Start the server
const port = Number(process.env.PORT || 3000);

if (process.env.NO_NET) {
  console.log('\nExpress example skipped due to NO_NET=1');
} else {
  try {
    const server = app.listen(port);
    server.on('listening', () => {
      console.log(`Example server running at http://localhost:${port}`);
      console.log('\nTry these endpoints:');
      console.log(`1. Generate DigiPIN: http://localhost:${port}/generate?lat=28.6139&lng=77.2090`);
      console.log('2. Get location: http://localhost:${port}/location (with X-DIGIPIN header)');
    });
    server.on('error', (error) => {
      console.error('Express example skipped:', error.message);
    });
  } catch (error) {
    console.error('Express example skipped:', error.message);
  }
}
