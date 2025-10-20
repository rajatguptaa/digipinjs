// examples/full-usage-npm.js

const path = require("path");
const { Readable } = require("stream");

const {
  getDigiPin,
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  getCachedEncode,
  setCachedEncode,
  normalizeDigiPin,
  reverseGeocode,
  reverseGeocodeAsync,
  setReverseGeocodeResolver,
  clearReverseGeocodeResolver,
} = require("digipinjs");

const { BoundsError, PinFormatError } = require("digipinjs/errors");

// Node.js-only features
const {
  digiPinMiddleware,
  generateGrid,
  watchEncodeStream,
  watchDecodeStream,
} = require("digipinjs/node");

// 1. Basic encoding/decoding with format control
const lat = 28.6139;
const lng = 77.2090;
const pin = getDigiPin(lat, lng, { format: "hyphenated" });
console.log("Encoded DIGIPIN:", pin);

const coords = getLatLngFromDigiPin(pin);
console.log("Decoded coordinates:", coords);

// 2. Batch encoding/decoding
const batchPins = batchEncode(
  [
    { lat: 28.6139, lng: 77.2090 }, // Delhi
    { lat: 19.0760, lng: 72.8777 }, // Mumbai
  ],
  { format: "compact" }
);
console.log("Batch encoded DIGIPINs:", batchPins);

const batchCoords = batchDecode(batchPins);
console.log("Batch decoded coordinates:", batchCoords);

// 3. Caching helpers
const cached = getCachedEncode(lat, lng, "hyphenated");
if (cached) {
  console.log("Cache hit:", cached);
} else {
  setCachedEncode(lat, lng, pin, "hyphenated");
  console.log("Cache miss: value stored");
}

// 4. Reverse geocoding with custom resolver hook
setReverseGeocodeResolver(async (digiPin) => {
  if (digiPin === normalizeDigiPin(pin)) {
    return {
      pin: digiPin,
      latitude: coords.latitude,
      longitude: coords.longitude,
      label: "New Delhi",
    };
  }
  return undefined;
});

(async () => {
  const rev = await reverseGeocodeAsync(pin);
  console.log("Reverse geocoded (async):", rev);
  clearReverseGeocodeResolver();
  console.log("Reverse geocoded (fallback):", reverseGeocode(pin));
})();

// 5. Express middleware (demo)
// Skipped in restricted environments (no socket binds)
if (process.env.NO_NET) {
  console.log("Express middleware demo skipped due to NO_NET=1");
} else {
  try {
    const express = require("express");
    const app = express();
    app.use(digiPinMiddleware());
    app.get("/test", (req, res) => {
      res.send("Check X-DIGIPIN header!");
    });
    const server = app.listen(0);
    server.on("listening", () => {
      const port = server.address().port;
      console.log(`Express middleware test server running on port ${port}`);
      server.close();
    });
    server.on("error", (err) => {
      console.error("Express middleware demo skipped:", err.message);
    });
  } catch (error) {
    console.error("Express middleware demo skipped:", error.message);
  }
}

// 6. Offline grid generation (sample)
const gridFile = path.join(__dirname, "grid-sample.ndjson");
generateGrid(28, 76.5, 28.2, 76.7, 0.05, gridFile, {
  outputFormat: "ndjson",
  format: "compact",
});
console.log("Generated offline grid sample saved to:", gridFile);

// 7. Stream helpers (simulate stdin with Readable.from)
const encodeStream = Readable.from([
  JSON.stringify({ lat, lng }) + "\n",
  JSON.stringify({ lat: 19.0760, lng: 72.8777 }) + "\n",
]);
watchEncodeStream(encodeStream, {
  inputFormat: "json",
  format: "hyphenated",
  onResult: ({ pin: streamPin }) => console.log("watchEncodeStream:", streamPin),
  onError: (error, raw) => console.error("watchEncodeStream error:", raw, error.message),
});

const decodeStream = Readable.from([`${pin}\n`, "39J438TJC7\n"]);
watchDecodeStream(decodeStream, {
  onResult: ({ pin: decodedPin, latitude, longitude }) =>
    console.log("watchDecodeStream:", decodedPin, latitude, longitude),
  onError: (error, raw) => console.error("watchDecodeStream error:", raw, error.message),
});

// 8. Error handling
try {
  getDigiPin(100, 200);
} catch (e) {
  if (e instanceof BoundsError) {
    console.error("Expected BoundsError:", e.message);
  }
}

try {
  getLatLngFromDigiPin("INVALIDPIN");
} catch (e) {
  if (e instanceof PinFormatError) {
    console.error("Expected PinFormatError:", e.message);
  }
}
