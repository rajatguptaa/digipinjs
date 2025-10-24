# DigiPIN.js - Indian Postal Code to Coordinates Converter
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm version](https://badge.fury.io/js/digipinjs.svg)](https://badge.fury.io/js/digipinjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

> **A comprehensive TypeScript library for encoding and decoding Indian geographic coordinates into DIGIPIN format (Indian Postal Digital PIN system). Features CLI tools, caching, batch processing, and Express middleware for seamless integration.**

👉 **Live demo:** [thedigipin.net](https://thedigipin.net/?tab=0&zoom=5&encTab=0&base=cartoDark)

## 🚀 Quick Start

```bash
# Install the package
npm install digipinjs

# Use the CLI tool
npx digipin-cli encode --lat 28.6139 --lng 77.2090
# Output: 39J-438-TJC7

# Use in your code (ESM shown, CJS via require works too)
import { getDigiPin } from 'digipinjs';

const pin = getDigiPin(28.6139, 77.2090, { format: 'hyphenated' });
// pin === '39J-438-TJC7'
```

## 📍 What is DIGIPIN?

**DIGIPIN** (Digital PIN) is India's official postal coordinate encoding system developed by the **Department of Posts, Government of India**. It converts geographic coordinates (latitude/longitude) into a compact 10-character alphanumeric code, making it easier to identify and locate addresses across the Indian subcontinent.

### Key Benefits:
- **Compact**: 10-character codes instead of long coordinates
- **Human-readable**: Easy to remember and share
- **Official**: Government-approved system
- **Accurate**: High precision for Indian subcontinent
- **Standardized**: Consistent format across India

## 🌟 Features

### Core DIGIPIN Functions
- ✅ **Coordinate to DIGIPIN**: Convert lat/lng to DIGIPIN with configurable rounding and formatting (hyphenated or compact)
- ✅ **DIGIPIN to Coordinates**: Reverse lookup with caching and normalized validation helpers
- ✅ **Indian Subcontinent Support**: Optimized for India (2.5°N-38.5°N, 63.5°E-99.5°E)
- ✅ **Typed Errors**: Purpose-built `BoundsError`, `PinFormatError`, `InvalidCharacterError` for clear handling

### Enhanced Features
- 🚀 **CLI Tooling**: Encode/decode, batch utilities, distance/nearest helpers, JSON output, and stdin watch mode
- ⚡ **Batch Processing**: Encode/decode arrays with shared options; stream-friendly Node helpers
- 💾 **Dual Caches**: LRU caches for encode and decode paths for high-throughput scenarios
- 🧭 **Geospatial Utilities**: Distance, precise distance, ordering, and nearest helpers supporting pre-decoded coordinates
- 🌐 **Express Middleware**: Drop-in header-based DIGIPIN injection
- 📊 **Grid Generation**: Stream grids to NDJSON/JSON with validation and formatting controls
- 🛰️ **Reverse Geocode Hooks**: Plug in custom providers with sync or async fallbacks
- 🔁 **Node Streams**: Re-useable encode/decode watchers for piping from stdin or other streams
- 🧱 **Dual Module Builds**: ESM & CommonJS outputs with typed subpath exports for `node`, `watch`, and `errors`

## ✅ NEW: Geospatial Utilities with DIGIPIN Support

We’ve integrated [**geolib**](https://www.npmjs.com/package/geolib) so you can now calculate distances and proximity using DIGIPINs directly. The helpers accept either raw DIGIPIN strings or pre-decoded `{ latitude, longitude }` objects and let you plug in custom distance strategies when needed.

### 📏 getDistance(pinA: string, pinB: string, accuracy = 1)

```ts
import { getDistance } from 'digipinjs';

const delhi = '39J-438-TJC7';
const mumbai = '4FK-595-8823';

const distance = getDistance(delhi, mumbai);
console.log(`Distance between Delhi and Mumbai: ${distance}m`);
```

### 📏 getPreciseDistance(pinA: string, pinB: string, accuracy = 1)

```ts
import { getPreciseDistance } from 'digipinjs';

const distance = getPreciseDistance('39J-438-TJC7', '4FK-595-8823');
console.log(`Precise distance (Vincenty): ${distance}m`);
```

### 📍 orderByDistance(referencePin: string, pins: string\[])

```ts
import { orderByDistance } from 'digipinjs';

const pins = ['4FK-595-8823', '4PJ-766-C924'];
const ordered = orderByDistance('39J-438-TJC7', pins, {
  accuracy: 0.1,
});

console.log('Sorted by distance:', ordered);
```

### 🧭 findNearest(reference: PinInput, pins: PinInput\[])

```ts
import { findNearest } from 'digipinjs';

const pins = [
  { latitude: 18.5204, longitude: 73.8567 }, // Pune (pre-decoded)
  '4FK-595-8823',
  '422-5C2-LTTF',
];
const nearest = findNearest('39J-438-TJC7', pins);

console.log('Nearest location:', nearest);
```

## 📦 Installation

```bash
# Using npm
npm install digipinjs

# Using yarn
yarn add digipinjs

# Using pnpm
pnpm add digipinjs
```

## 🌐 Browser Compatibility

This package is **fully compatible with browser environments** (React, Vue, Angular, etc.) and Node.js environments.

### Browser Usage (React, Vue, Angular, etc.)
```typescript
// ✅ Works in browsers - no Node.js dependencies
import { getDigiPin, getLatLngFromDigiPin, batchEncode } from 'digipinjs';

const pin = getDigiPin(28.6139, 77.2090); // Delhi coordinates
console.log(pin); // "39J-438-TJC7"
```

### Node.js Usage (Server-side)
```typescript
// ✅ Full Node.js features including CLI, middleware, file operations, and streams
import express from 'express';
import { getDigiPin, normalizeDigiPin } from 'digipinjs';
import {
  digiPinMiddleware,
  generateGrid,
  watchEncodeStream,
  watchDecodeStream,
  setReverseGeocodeResolver,
  reverseGeocodeAsync,
} from 'digipinjs/node';

// Core functionality
const pin = getDigiPin(28.6139, 77.2090, { format: 'compact' });

// Express middleware still works the same
const app = express();
app.use(digiPinMiddleware());

// Optional reverse geocode resolver for richer metadata
setReverseGeocodeResolver(async (pin) => {
  if (pin === normalized) {
    return { pin, latitude: 28.6139, longitude: 77.2090, label: 'New Delhi' };
  }
  return undefined;
});

// Stream-friendly grid generation
generateGrid(20, 70, 30, 80, 0.1, 'grid.ndjson', {
  outputFormat: 'ndjson',
  format: 'compact',
});

// Pipe coordinates from stdin, receive DIGIPINs in real time
watchEncodeStream(process.stdin, {
  inputFormat: 'json',
  format: 'hyphenated',
  onResult: ({ pin: generated }) => console.log('PIN', generated),
  onError: (error) => console.error('Failed:', error.message),
});

// Decode stream of DIGIPINs
watchDecodeStream(process.stdin, {
  onResult: ({ pin: raw, latitude, longitude }) => {
    console.log(raw, latitude, longitude);
  },
});

// Validation helpers
const normalized = normalizeDigiPin('k4p-9c6-lmpt');

// Access the resolver output when needed
(async () => {
  const resolved = await reverseGeocodeAsync('39J-438-TJC7');
  console.log(resolved);
})();
```

### Available Exports by Environment

| Feature | Browser | Node.js | CLI |
|---------|---------|---------|-----|
| Core encoding/decoding | ✅ | ✅ | ✅ |
| Batch processing | ✅ | ✅ | ✅ |
| Caching | ✅ | ✅ | ✅ |
| Express middleware | ❌ | ✅ | ❌ |
| Grid generation | ❌ | ✅ | ❌ |
| CLI tools | ❌ | ❌ | ✅ |

> **CommonJS?** Use `const { getDigiPin } = require('digipinjs');`. Subpath exports such as `digipinjs/node`, `digipinjs/watch`, and `digipinjs/errors` resolve with accurate types in both module systems.

## 🛠️ Usage Examples

### 1. Command Line Interface (CLI)

```bash
# Encode with JSON output and compact DIGIPIN formatting
digipin-cli encode --lat 28.6139 --lng 77.2090 --json --pin-format compact

# Decode to coordinates (DMS output)
digipin-cli decode --pin 39J-438-TJC7 --format dms

# Batch encode / decode from JSON files
digipin-cli batch-encode ./data/coords.json --pin-format hyphenated --json
digipin-cli batch-decode ./data/pins.json --json

# Distance helpers
digipin-cli distance --from 39J-438-TJC7 --to 4FK-595-8823 --json
digipin-cli nearest --reference 39J-438-TJC7 --pins 4FK-595-8823,4PJ-766-C924 --json

# Watch stdin (CSV lat,lng per line) and stream DIGIPINs
printf '28.6139,77.2090\n19.0760,72.8777\n' | digipin-cli encode --watch --watch-format csv
```

#### Validation and errors
- The CLI and library emit typed errors: `BoundsError`, `PinFormatError`, `InvalidCharacterError`.
- Use `--json` to receive machine-readable payloads for automation.
- Error classes are exported from the `digipinjs/errors` subpath for programmatic checks.

### 2. Programmatic Usage

#### Browser Usage (React, Vue, Angular, etc.)
```typescript
import { 
  getDigiPin, 
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  getCachedEncode,
  setCachedEncode,
  normalizeDigiPin,
  reverseGeocode 
} from 'digipinjs';
import { BoundsError } from 'digipinjs/errors';

// Basic encoding/decoding
const pin = getDigiPin(28.6139, 77.2090, { format: 'compact' });  // Delhi
console.log(pin); // "39J438TJC7"

const coords = getLatLngFromDigiPin(pin);
console.log(coords); // { latitude: 28.6139, longitude: 77.2090 }

// Batch processing for multiple locations
const locations = [
  { lat: 28.6139, lng: 77.2090 },  // Delhi
  { lat: 19.0760, lng: 72.8777 },  // Mumbai
  { lat: 12.9716, lng: 77.5946 }   // Bangalore
];

const pins = batchEncode(locations);
console.log(pins); // ["39J-438-TJC7", "4FK-595-8823", "2L7-3K9-8P2F"]

// Caching for performance
const cachedPin = getCachedEncode(28.6139, 77.2090, 'hyphenated');
if (!cachedPin) {
  const pin = getDigiPin(28.6139, 77.2090);
  setCachedEncode(28.6139, 77.2090, pin, 'hyphenated');
}

// Normalization helper
const normalized = normalizeDigiPin('k4p-9c6-lmpt');
console.log(normalized); // "K4P9C6LMPT"

try {
  getDigiPin(100, 200);
} catch (error) {
  if (error instanceof BoundsError) {
    console.error('Out of bounds');
  }
}
```

#### Node.js Usage (Server-side)
```typescript
import express from 'express';
import { getDigiPin, setReverseGeocodeResolver, reverseGeocodeAsync } from 'digipinjs';
import {
  digiPinMiddleware,
  generateGrid,
  watchEncodeStream,
  watchDecodeStream,
} from 'digipinjs/node';

// Plug in your own data source for human-readable reverse geocoding
const myDatabase = {
  lookup: async (pin: string) => undefined,
};

const app = express();
app.use(digiPinMiddleware());

// Optional: hook up your own reverse geocode provider (sync or async)
setReverseGeocodeResolver(async (pin) => {
  const match = await myDatabase.lookup(pin);
  if (!match) return undefined; // default fallback to coordinate decode
  return { pin, ...match };
});

// Generate NDJSON grids safely without loading everything into memory
generateGrid(20, 70, 30, 80, 0.25, 'grid.ndjson', {
  outputFormat: 'ndjson',
  format: 'hyphenated',
});

// Stream encode coordinates from stdin (JSON objects)
watchEncodeStream(process.stdin, {
  inputFormat: 'json',
  format: 'compact',
  onResult: ({ pin }) => process.stdout.write(`${pin}\n`),
  onError: (error, raw) => console.error('encode failed', raw, error.message),
});

// Stream decode DIGIPINs from stdin
watchDecodeStream(process.stdin, {
  onResult: ({ pin, latitude, longitude }) =>
    console.log(pin, latitude, longitude),
});

// Inspect resolver output when needed
(async () => {
  const resolved = await reverseGeocodeAsync('39J-438-TJC7');
  console.log(resolved);
})();
```

Note: When running in restricted environments (e.g., CI sandboxes where socket binds are blocked), you can skip the Express demo in our example script by setting `NO_NET=1`:
```bash
NO_NET=1 node examples/full-usage-npm.js
```

#### Reverse Geocoding
```typescript
import { reverseGeocode, reverseGeocodeAsync } from 'digipinjs';

// Sync helper (falls back to coordinate decode if no resolver matches)
const fallback = reverseGeocode('39J-438-TJC7');
console.log(fallback); // { pin: '39J-438-TJC7', latitude: ..., longitude: ... }

async function demo() {
  // Async helper supports custom providers configured via setReverseGeocodeResolver
  const resolved = await reverseGeocodeAsync('39J-438-TJC7');
  console.log(resolved);
}

demo();
```

#### Geo Utilities
```typescript
import {
  getDistance,
  getPreciseDistance,
  orderByDistance,
  findNearest
} from 'digipinjs';

const delhi = '39J-438-TJC7';
const mumbai = '4FK-595-8823';

console.log(getDistance(delhi, mumbai, 1));        // distance in meters
console.log(getPreciseDistance(delhi, mumbai, 1)); // precise distance

const pins = [
  mumbai,
  { latitude: 12.9716, longitude: 77.5946 }, // Bangalore (pre-decoded)
];
console.log(orderByDistance(delhi, pins)); // sorted by proximity
console.log(findNearest(delhi, pins));    // nearest pin (returns original input shape)
```

### 3. Common Use Cases

#### E-commerce & Delivery
```typescript
// Convert customer address to DIGIPIN for delivery tracking
const customerLocation = getDigiPin(19.0760, 72.8777); // Mumbai
console.log(`Delivery DIGIPIN: ${customerLocation}`);
```

#### Real Estate Applications
```typescript
// Property location encoding
const propertyPin = getDigiPin(12.9716, 77.5946); // Bangalore
console.log(`Property DIGIPIN: ${propertyPin}`);
```

#### Emergency Services
```typescript
// Quick location identification
const emergencyLocation = getDigiPin(28.6139, 77.2090); // Delhi
console.log(`Emergency DIGIPIN: ${emergencyLocation}`);
```

## 🗺️ Supported Geographic Region

The library supports the **Indian subcontinent** with the following coordinate bounds:

- **Latitude**: 2.5°N to 38.5°N (covers all of India)
- **Longitude**: 63.5°E to 99.5°E (covers all of India)

This includes:
- 🇮🇳 **India** (all states and union territories)

## 📋 DIGIPIN Format Specification

### Format: `XXX-XXX-XXXX`
- **Total Length**: 10 characters (excluding hyphens)
- **Valid Characters**: F, C, 9, 8, J, 3, 2, 7, K, 4, 5, 6, L, M, P, T
- **Hyphen Positions**: After 3rd and 6th characters
- **Example**: `FC9-8J3-27K4`

### Character Set
The DIGIPIN system uses a 16-character alphabet optimized for Indian postal operations:
- **Letters**: F, J, K, L, M, P, T
- **Numbers**: 2, 3, 4, 5, 6, 7, 8, 9
- **Special**: C

## ⚠️ Error Handling

The library provides comprehensive error handling with clear messages:

```typescript
try {
  getDigiPin(100, 200); // Out of bounds
} catch (error) {
  console.error(error.message); // "Latitude out of range"
}

try {
  getLatLngFromDigiPin("INVALID"); // Invalid format
} catch (error) {
  console.error(error.message); // "Invalid DIGIPIN"
}
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/rajatguptaa/digipinjs.git
cd digipinjs

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Run the example
node examples/full-usage-npm.js
# Geocoding & geo utilities example
node examples/geocode-example.js

# If running in restricted environments (no socket binds)
NO_NET=1 node examples/full-usage-npm.js
```

## 📊 Performance

- **Encoding Speed**: ~10,000 operations/second
- **Decoding Speed**: ~15,000 operations/second
- **Cache Hit Rate**: 95%+ for repeated coordinates
- **Memory Usage**: Minimal with LRU cache (max 10,000 entries)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
npm install
npm run build
npm test
```

## 👥 Contributors

We'd like to thank the following contributors:

- Department of Posts, Government of India
- Indian Institute of Technology, Hyderabad
- National Remote Sensing Centre, ISRO
- [Amogh Chavan](https://github.com/amogh-chavan)

## 📄 License

This project is dual-licensed:

- **Wrapper Implementation**: MIT License (new code)
- **Original DIGIPIN**: Apache License 2.0 (core algorithm)

See [LICENSE](LICENSE) file for full details.

## 🙏 Attribution

This package is based on the original [DIGIPIN](https://github.com/CEPT-VZG/digipin) project developed by:
- **Department of Posts, Government of India**
- **Indian Institute of Technology, Hyderabad**
- **National Remote Sensing Centre, ISRO**

## 🔗 Related Projects

- [DIGIPIN Original](https://github.com/CEPT-VZG/digipin) - Original implementation
- [India Post API](https://www.indiapost.gov.in/) - Official postal services
- [OpenStreetMap India](https://openstreetmap.in/) - Open mapping data

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/rajatguptaa/digipinjs/issues)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rajatguptaa/digipinjs&type=Date)](https://star-history.com/#rajatguptaa/digipinjs&Date)

---
## 🤝 Contributors

Thanks to these amazing contributors:

- [@rajatguptaa](https://github.com/rajatguptaa) – Creator & Maintainer  
- [@amogh-chavan](https://github.com/amogh-chavan) – Contributor (PR [#3](https://github.com/rajatguptaa/digipinjs/pull/3))

---

**Made with ❤️ for the Indian developer community**

*This package helps developers integrate India's official postal coordinate system into their applications with ease and reliability.*
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/rajatguptaa"><img src="https://github.com/rajatguptaa.png?size=100" width="100px;" alt="Rajat Gupta"/><br /><sub><b>Rajat Gupta</b></sub></a><br />
      <a href="#maintenance-rajatguptaa" title="Maintenance">🚧</a>
      <a href="https://github.com/rajatguptaa/digipinjs/commits?author=rajatguptaa" title="Code">💻</a>
      <a href="https://github.com/rajatguptaa/digipinjs/commits?author=rajatguptaa" title="Documentation">📖</a>
    </td>
    <td align="center"><a href="https://github.com/amogh-chavan"><img src="https://github.com/amogh-chavan.png?size=100" width="100px;" alt="Amogh Chavan"/><br /><sub><b>Amogh Chavan</b></sub></a><br />
      <a href="https://github.com/rajatguptaa/digipinjs/commits?author=amogh-chavan" title="Code">💻</a>
    </td>
  </tr>
  
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
