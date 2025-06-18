const { getDigiPin, getCached, setCached } = require('digipinjs');

console.log('🧪 Starting Cache Tests...\n');

// Test 1: Basic Cache Set and Get
console.log('Test 1: Basic Cache Set and Get');
const lat1 = 28.6139;
const lng1 = 77.2090;
console.log('Initial cache check:', getCached(lat1, lng1));
const pin1 = getDigiPin(lat1, lng1);
setCached(lat1, lng1, pin1);
console.log('After setting cache:', getCached(lat1, lng1));
console.log('Cache hit matches original pin:', getCached(lat1, lng1) === pin1);
console.log();

// Test 2: Multiple Cache Entries
console.log('Test 2: Multiple Cache Entries');
const locations = [
    { lat: 19.0760, lng: 72.8777 }, // Mumbai
    { lat: 12.9716, lng: 77.5946 }, // Bangalore
    { lat: 22.5726, lng: 88.3639 }  // Kolkata
];

console.log('Setting multiple cache entries...');
locations.forEach(loc => {
    const pin = getDigiPin(loc.lat, loc.lng);
    setCached(loc.lat, loc.lng, pin);
    console.log(`Cache set for (${loc.lat}, ${loc.lng}): ${pin}`);
});

console.log('\nVerifying cache hits...');
locations.forEach(loc => {
    const cached = getCached(loc.lat, loc.lng);
    console.log(`Cache hit for (${loc.lat}, ${loc.lng}): ${cached}`);
});
console.log();

// Test 3: Cache Overwrite
console.log('Test 3: Cache Overwrite');
const testLat = 28.6139;
const testLng = 77.2090;
const originalPin = getDigiPin(testLat, testLng);
console.log('Original pin:', originalPin);
setCached(testLat, testLng, originalPin);
console.log('First cache set:', getCached(testLat, testLng));

const newPin = '39J-438-XXXX'; // Different pin for same coordinates
setCached(testLat, testLng, newPin);
console.log('After overwrite:', getCached(testLat, testLng));
console.log();

// Test 4: Edge Cases
console.log('Test 4: Edge Cases');
console.log('Undefined coordinates:', getCached(undefined, undefined));
console.log('Invalid coordinates:', getCached(-100, 200));
console.log('Zero coordinates:', getCached(0, 0));
console.log('String coordinates:', getCached('28.6139', '77.2090'));
console.log();

// Test 5: Cache Persistence
console.log('Test 5: Cache Persistence');
const persistLat = 13.0827;
const persistLng = 80.2707; // Chennai
const persistPin = getDigiPin(persistLat, persistLng);
setCached(persistLat, persistLng, persistPin);
console.log('Initial cache set:', getCached(persistLat, persistLng));

// Simulate multiple gets to test persistence
for(let i = 0; i < 5; i++) {
    console.log(`Get attempt ${i + 1}:`, getCached(persistLat, persistLng));
} 