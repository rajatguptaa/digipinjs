# DigiPIN Wrapper

A TypeScript library for encoding and decoding geographic coordinates into DIGIPIN format, with additional features like caching, batch processing, and a command-line interface.

## Features

- **Core Functions**:
  - `getDigiPin`: Convert lat/lng to DIGIPIN
  - `getLatLngFromDigiPin`: Convert DIGIPIN to lat/lng
  - Coordinate validation and error handling
  - Support for Indian subcontinent coordinates (2.5°N to 38.5°N, 63.5°E to 99.5°E)

- **CLI Tool**:
  - Encode coordinates to DIGIPIN
  - Decode DIGIPIN to coordinates
  - Support for different coordinate formats (degrees, DMS)
  - Verbose mode for detailed output
  - Colored output for better readability
  - Comprehensive error handling

- **Additional Features**:
  - Batch encoding/decoding
  - Express middleware
  - In-memory LRU cache
  - Offline grid generator
  - Reverse geocoding

## Installation

```bash
npm install digipinjs
```

## Usage

### Command Line Interface

The CLI tool provides an easy way to encode and decode DIGIPINs:

```bash
# Basic usage
digipin-cli encode --lat 28.6139 --lng 77.2090
digipin-cli decode --pin FC9-8J3-27K4

# Verbose mode with detailed output
digipin-cli encode --lat 28.6139 --lng 77.2090 --verbose
digipin-cli decode --pin FC9-8J3-27K4 --verbose

# Using DMS (Degrees, Minutes, Seconds) format
digipin-cli encode --lat 28.6139 --lng 77.2090 --verbose --format dms
digipin-cli decode --pin FC9-8J3-27K4 --verbose --format dms

# Show help
digipin-cli --help
```

#### CLI Options

- **Encode Command**:
  - `--lat`: Latitude (2.5° to 38.5°)
  - `--lng`: Longitude (63.5° to 99.5°)
  - `--verbose`: Show detailed information
  - `--format`: Coordinate format (degrees or dms)

- **Decode Command**:
  - `--pin`: DIGIPIN to decode (format: XXX-XXX-XXXX)
  - `--verbose`: Show detailed information
  - `--format`: Coordinate format (degrees or dms)

### Programmatic Usage

```typescript
import { 
  getDigiPin, 
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  digiPinMiddleware,
  getCached,
  setCached,
  reverseGeocode 
} from 'digipinjs';

// Basic encoding/decoding
const pin = getDigiPin(28.6139, 77.2090);  // Returns: "39J-438-TJC7"
const coords = getLatLngFromDigiPin(pin);  // Returns: { latitude: 28.6139, longitude: 77.2090 }

// Batch processing
const pins = batchEncode([
  { lat: 28.6139, lng: 77.2090 },  // Delhi
  { lat: 19.0760, lng: 72.8777 }   // Mumbai
]);

const coordinates = batchDecode([
  "39J-438-TJC7",  // Delhi
  "4FK-595-8823"   // Mumbai
]);

// Express middleware
import express from 'express';
const app = express();
app.use(digiPinMiddleware());  // Adds X-DIGIPIN header based on x-lat & x-lng headers

// Caching
const cachedPin = getCached(28.6139, 77.2090);
if (!cachedPin) {
  const pin = getDigiPin(28.6139, 77.2090);
  setCached(28.6139, 77.2090, pin);
}

// Reverse geocoding
const location = reverseGeocode("39J-438-TJC7");
```

### Coordinate Bounds

The library supports coordinates within the following bounds:
- Latitude: 2.5°N to 38.5°N
- Longitude: 63.5°E to 99.5°E

### DIGIPIN Format

A DIGIPIN is a 10-character code (excluding hyphens) in the format: `XXX-XXX-XXXX`
- Valid characters: F,C,9,8,J,3,2,7,K,4,5,6,L,M,P,T
- Example: `FC9-8J3-27K4`

## Error Handling

The library provides clear error messages for various scenarios:
- Invalid coordinates (out of bounds)
- Invalid DIGIPIN format
- Invalid characters in DIGIPIN
- Missing or invalid parameters

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## License

MIT