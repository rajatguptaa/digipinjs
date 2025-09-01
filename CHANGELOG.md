# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.12] - 2025-09-01
### Changed
- Version bump to trigger publish via GitHub Actions using NPM_AUTH secret.

## [1.1.11] - 2025-08-31
### Changed
- Use NPM_AUTH secret fallback in release workflow and bump to trigger publish.

## [1.1.10] - 2025-08-31
### Changed
- Version bump to trigger GitHub Actions npm publish.
## [1.1.9] - 2025-08-31
### Added
- Strong DIGIPIN validator with strict length and character checks.
- Validator test suite.

### Changed
- Moved `reverseGeocode` to dedicated module `src/reverseGeocode.ts` and updated exports.
- Updated README/CONTRIBUTING with guidance for running examples in restricted environments using `NO_NET=1`.
- Fixed CLI epilog link to point to the correct repository.

## [1.1.8] - 2025-06-24
### Added
- Reverse geocoding example demonstrating geo utilities
- Mention Amogh Chavan in contributors
- Document geocoding helpers in README
### Changed
- Bumped package version to 1.1.8

## [1.1.3] - 2025-06-18

### Changed
- Bumped package version to 1.1.3

## [1.1.0] - 2024-12-19

### Added
- Enhanced SEO-optimized README with comprehensive documentation
- Added more relevant keywords for better npm discoverability
- Improved package description for better clarity
- Added author email for better package metadata
- Created comprehensive usage examples and use cases
- Added performance metrics documentation
- Enhanced error handling examples

### Changed
- Updated package version from 1.0.0 to 1.1.0
- Improved package description to be more comprehensive
- Enhanced keywords list with postal, delivery, and geographic terms
- Removed circular dependency (digipinjs depending on itself)
- Removed unused NOTICE file from package files
- Updated author information with full name and email

### Fixed
- Fixed circular dependency issue in package.json
- Removed unused bottleneck dependency
- Cleaned up package files list

### Documentation
- Added comprehensive README with SEO optimization
- Added usage examples for different industries (e-commerce, real estate, emergency services)
- Added performance benchmarks
- Added geographic coverage information
- Added support and contribution guidelines

## [1.0.0] - 2024-12-19

### Added
- Initial release of digipinjs
- Core DIGIPIN encoding and decoding functionality
- CLI tool for command-line usage
- Express middleware for web applications
- Batch processing capabilities
- LRU caching for performance optimization
- TypeScript support with full type definitions
- Comprehensive test suite
- Error handling and validation
- Offline grid generation
- Reverse geocoding functionality

### Features
- Convert latitude/longitude to DIGIPIN format
- Convert DIGIPIN back to coordinates
- Support for Indian subcontinent coordinates (2.5°N-38.5°N, 63.5°E-99.5°E)
- Command-line interface with verbose and DMS format support
- Express.js middleware integration
- Batch encoding and decoding
- In-memory caching with LRU eviction
- Offline grid generation for bulk operations
- Comprehensive error handling and validation
- Full TypeScript support

### Technical Details
- Built with TypeScript for type safety
- Uses LRU cache for performance optimization
- Supports both CommonJS and ES modules
- Comprehensive test coverage
- ESLint configuration for code quality
- Mocha test framework with Chai assertions 
