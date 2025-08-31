// examples/full-usage-npm.js

const {  
  getDigiPin,  
  getLatLngFromDigiPin,  
  batchEncode,  
  batchDecode,  
  getCached,  
  setCached,  
  reverseGeocode  
} = require("digipinjs");

// Node.js-only features
const {  
  digiPinMiddleware,  
  generateGrid  
} = require("digipinjs/node");

const path = require("path");

// 1. Basic encoding/decoding  
const lat = 28.6139;  
const lng = 77.2090;  
const pin = getDigiPin(lat, lng);  
console.log("Encoded DIGIPIN:", pin);  

const coords = getLatLngFromDigiPin(pin);  
console.log("Decoded coordinates:", coords);  

// 2. Batch encoding/decoding  
const batchPins = batchEncode([  
  { lat: 28.6139, lng: 77.2090 }, // Delhi  
  { lat: 19.0760, lng: 72.8777 }  // Mumbai  
]);  
console.log("Batch encoded DIGIPINs:", batchPins);  

const batchCoords = batchDecode(batchPins);  
console.log("Batch decoded coordinates:", batchCoords);  

// 3. Caching  
const cached = getCached(lat, lng);  
if (cached) {  
  console.log("Cache hit:", cached);  
} else {  
  setCached(lat, lng, pin);  
 console.log("Cache miss: Value set");  
}  

// 4. Reverse geocoding  
const rev = reverseGeocode(pin);  
console.log("Reverse geocoded:", rev);  

// 5. Express middleware (demo)  
// Skipped in restricted environments (no socket binds)
if (!process.env.NO_NET) {
  const express = require("express");  
  const app = express();  
  app.use(digiPinMiddleware());  
  app.get("/test", (req, res) => {  
    res.send("Check X-DIGIPIN header!");  
  });  
  const server = app.listen(0, () => {  
    const port = (server.address()).port;  
    console.log(`Express middleware test server running on port ${port}`);  
    server.close();  
  });  
} else {
  console.log("Express middleware demo skipped due to NO_NET=1");
}

// 6. Offline grid generation (sample)  
const gridFile = path.join(__dirname, 'grid-sample.json');  
generateGrid(2.5, 63.5, 3.0, 64.0, 0.1, gridFile);  
console.log('Generated offline grid sample saved to:', gridFile);  

// 7. Error handling (out of bounds)  
try {  
  getDigiPin(100, 200);  
} catch (e) {  
  console.error("Expected error (out of bounds):", e.message);  
}  

// 8. Error handling (invalid pin)  
try {  
  getLatLngFromDigiPin("INVALIDPIN");  
} catch (e) {  
 console.error("Expected error (invalid pin):", e.message);  
}  
