# DigiPIN.js - Indian Postal Code to Coordinates Converter

[![npm version](https://badge.fury.io/js/digipinjs.svg)](https://badge.fury.io/js/digipinjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

> **A comprehensive TypeScript library for encoding and decoding Indian geographic coordinates into DIGIPIN format (Indian Postal Digital PIN system). Features CLI tools, caching, batch processing, and Express middleware for seamless integration.**

## 🚀 Quick Start

```bash
# Install the package
npm install digipinjs

# Use the CLI tool
npx digipin-cli encode --lat 28.6139 --lng 77.2090
# Output: 39J-438-TJC7

# Use in your code
import { getDigiPin } from 'digipinjs';
const pin = getDigiPin(28.6139, 77.2090); // Delhi coordinates
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
- ✅ **Coordinate to DIGIPIN**: Convert lat/lng to 10-character code
- ✅ **DIGIPIN to Coordinates**: Reverse lookup with high precision
- ✅ **Indian Subcontinent Support**: Optimized for India (2.5°N-38.5°N, 63.5°E-99.5°E)
- ✅ **Validation**: Built-in coordinate bounds checking
- ✅ **Error Handling**: Comprehensive error messages

### Enhanced Features
- 🚀 **CLI Tool**: Command-line interface for quick conversions
- ⚡ **Batch Processing**: Handle multiple coordinates efficiently
- 💾 **Caching**: LRU cache for improved performance
- 🌐 **Express Middleware**: Easy integration with web applications
- 📊 **Grid Generation**: Create offline coordinate grids
- 🔄 **Reverse Geocoding**: Convert DIGIPIN back to coordinates
- 📝 **TypeScript Support**: Full type definitions included

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
// ✅ Full Node.js features including CLI, middleware, and file operations
import { getDigiPin } from 'digipinjs';
import { generateGrid, digiPinMiddleware } from 'digipinjs/node';

// Core functionality
const pin = getDigiPin(28.6139, 77.2090);

// Node.js specific features
generateGrid(20, 70, 30, 80, 0.1, 'grid.json');
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

## 🛠️ Usage Examples

### 1. Command Line Interface (CLI)

```bash
# Basic encoding (Delhi coordinates)
digipin-cli encode --lat 28.6139 --lng 77.2090
# Output: 39J-438-TJC7

# Basic decoding
digipin-cli decode --pin 39J-438-TJC7
# Output: Latitude: 28.613901°, Longitude: 77.208998°

# Verbose mode with detailed information
digipin-cli encode --lat 28.6139 --lng 77.2090 --verbose

# DMS (Degrees, Minutes, Seconds) format
digipin-cli encode --lat 28.6139 --lng 77.2090 --verbose --format dms
```

### 2. Programmatic Usage

#### Browser Usage (React, Vue, Angular, etc.)
```typescript
import { 
  getDigiPin, 
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  getCached,
  setCached,
  reverseGeocode 
} from 'digipinjs';

// Basic encoding/decoding
const pin = getDigiPin(28.6139, 77.2090);  // Delhi
console.log(pin); // "39J-438-TJC7"

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
const cachedPin = getCached(28.6139, 77.2090);
if (!cachedPin) {
  const pin = getDigiPin(28.6139, 77.2090);
  setCached(28.6139, 77.2090, pin);
}
```

#### Node.js Usage (Server-side)
```typescript
import { 
  getDigiPin, 
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  getCached,
  setCached,
  reverseGeocode 
} from 'digipinjs';

// Import Node.js specific features
import { digiPinMiddleware, generateGrid } from 'digipinjs/node';

// Basic encoding/decoding (same as browser)
const pin = getDigiPin(28.6139, 77.2090);  // Delhi
console.log(pin); // "39J-438-TJC7"

// Express.js middleware integration
import express from 'express';
const app = express();
app.use(digiPinMiddleware()); // Automatically adds X-DIGIPIN header

// Grid generation for offline use
generateGrid(20, 70, 30, 80, 0.1, 'grid.json');
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
- 📖 **Documentation**: [Full Documentation](https://digipinjs.com)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/rajatguptaa/digipinjs/discussions)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rajatguptaa/digipinjs&type=Date)](https://star-history.com/#rajatguptaa/digipinjs&Date)

---

**Made with ❤️ for the Indian developer community**

*This package helps developers integrate India's official postal coordinate system into their applications with ease and reliability.*