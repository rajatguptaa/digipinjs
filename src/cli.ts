#!/usr/bin/env node

import fs from 'fs';
import chalk from 'chalk';
import yargs, { type Argv, type ArgumentsCamelCase, type CommandModule } from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  getDigiPin,
  getLatLngFromDigiPin,
  type DigiPinFormat,
  type EncodeOptions,
  type DecodeOptions,
  BOUNDS,
} from './core';
import { toGeoJson } from './geojson';
import { batchDecode, batchEncode } from './batch';
import {
  getDistance as getDistanceBetween,
  getPreciseDistance as getPreciseDistanceBetween,
  orderByDistance,
} from './geo';
import {
  BoundsError,
  DigiPinError,
  InvalidCharacterError,
  PinFormatError,
} from './errors';
import { normalizeDigiPin } from './util';
import {
  watchDecodeStream,
  watchEncodeStream,
  type WatchInputFormat,
} from './watch';

type Coordinate = { latitude: number; longitude: number };
type OutputFormat = 'degrees' | 'dms';

interface JsonOutputArgs {
  json?: boolean;
}

interface CacheArgs {
  cache?: boolean;
}

interface EncodeArgs extends ArgumentsCamelCase, JsonOutputArgs, CacheArgs {
  lat?: number;
  lng?: number;
  verbose?: boolean;
  format?: OutputFormat;
  pinFormat?: DigiPinFormat;
  round?: number;
  noRound?: boolean;
  watch?: boolean;
  watchFormat?: WatchInputFormat;
}

interface DecodeArgs extends ArgumentsCamelCase, JsonOutputArgs, CacheArgs {
  pin?: string;
  verbose?: boolean;
  format?: OutputFormat | 'geojson';
  watch?: boolean;
}

interface BatchEncodeArgs extends ArgumentsCamelCase, JsonOutputArgs, CacheArgs {
  file: string;
  pinFormat?: DigiPinFormat;
  round?: number;
  noRound?: boolean;
}

interface BatchDecodeArgs extends ArgumentsCamelCase, JsonOutputArgs, CacheArgs {
  file: string;
}

interface DistanceArgs extends ArgumentsCamelCase, JsonOutputArgs {
  from: string;
  to: string;
  precise?: boolean;
  accuracy?: number;
}

interface NearestArgs extends ArgumentsCamelCase, JsonOutputArgs {
  reference: string;
  file?: string;
  pins?: string;
  accuracy?: number;
}

function toDMS(decimal: number, isLatitude: boolean): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  const direction = isLatitude ? (decimal >= 0 ? 'N' : 'S') : decimal >= 0 ? 'E' : 'W';
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

function formatCoords(coords: Coordinate, format: OutputFormat = 'degrees'): string {
  if (format === 'dms') {
    return `Lat: ${toDMS(coords.latitude, true)}, Lng: ${toDMS(coords.longitude, false)}`;
  }
  return `Latitude: ${chalk.cyan(coords.latitude.toFixed(6))}°\nLongitude: ${chalk.cyan(coords.longitude.toFixed(6))}°`;
}

function printJson(payload: unknown, pretty = true): void {
  console.log(JSON.stringify(payload, null, pretty ? 2 : 0));
}

function handleError(error: unknown): never {
  if (error instanceof BoundsError) {
    console.error(chalk.red('\nError:'), error.message);
    console.error(
      chalk.yellow('Valid latitude range is'),
      `${BOUNDS.minLat}° to ${BOUNDS.maxLat}°`
    );
    console.error(
      chalk.yellow('Valid longitude range is'),
      `${BOUNDS.minLon}° to ${BOUNDS.maxLon}°`
    );
  } else if (error instanceof PinFormatError) {
    console.error(chalk.red('\nError:'), 'DIGIPIN must be 10 characters long (excluding hyphens)');
  } else if (error instanceof InvalidCharacterError) {
    console.error(chalk.red('Error:'), error.message);
  } else if (error instanceof DigiPinError) {
    console.error(chalk.red('\nError:'), error.message);
  } else if (error instanceof Error) {
    console.error(chalk.red('\nError:'), error.message);
  } else {
    console.error(chalk.red('\nUnknown error'), error);
  }
  process.exit(1);
}

function validateCoordinates(lat: number, lng: number): void {
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error('Invalid coordinates: must be numbers');
  }
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat) {
    throw new BoundsError(lat, undefined, BOUNDS);
  }
  if (lng < BOUNDS.minLon || lng > BOUNDS.maxLon) {
    throw new BoundsError(undefined, lng, BOUNDS);
  }
}

function loadJsonFile(path: string): unknown {
  const contents = fs.readFileSync(path, 'utf8');
  return JSON.parse(contents);
}

const encodeCommand: CommandModule<{}, EncodeArgs> = {
  command: 'encode',
  describe: 'Convert latitude/longitude to DIGIPIN',
  builder: (yargs: Argv<{}>): Argv<EncodeArgs> =>
    yargs
      .option('lat', {
        type: 'number',
        describe: 'Latitude (2.5° to 38.5°)',
      })
      .option('lng', {
        type: 'number',
        describe: 'Longitude (63.5° to 99.5°)',
      })
      .option('verbose', {
        type: 'boolean',
        default: false,
        describe: 'Show detailed information',
      })
      .option('json', {
        type: 'boolean',
        default: false,
        describe: 'Emit JSON output',
      })
      .option('format', {
        type: 'string',
        choices: ['degrees', 'dms'],
        default: 'degrees',
        describe: 'Coordinate format for verbose output',
      })
      .option('pin-format', {
        type: 'string',
        choices: ['hyphenated', 'compact'],
        default: 'hyphenated',
        describe: 'DIGIPIN output format',
      })
      .option('round', {
        type: 'number',
        describe: 'Round coordinates to the specified decimals before encoding (default: 6)',
      })
      .option('no-round', {
        type: 'boolean',
        default: false,
        describe: 'Disable coordinate rounding',
      })
      .option('cache', {
        type: 'boolean',
        default: true,
        describe: 'Enable encode cache',
      })
      .option('watch', {
        type: 'boolean',
        default: false,
        describe: 'Read coordinates from stdin (one per line)',
      })
      .option('watch-format', {
        type: 'string',
        choices: ['json', 'csv'],
        default: 'json',
        describe: 'Input format for watch mode',
      })
      .check((argv) => {
        if (!argv.watch) {
          if (argv.lat === undefined || argv.lng === undefined) {
            throw new Error('lat and lng are required unless --watch is enabled');
          }
        }
        return true;
      }) as Argv<EncodeArgs>,
  handler: (argv) => {
    try {
      const pinFormat = (argv.pinFormat ?? 'hyphenated') as DigiPinFormat;
      const roundTo = argv.noRound ? 'none' : argv.round ?? 6;

      if (argv.watch) {
        const watchFormat = (argv.watchFormat ?? 'json') as WatchInputFormat;
        watchEncodeStream(process.stdin, {
          format: pinFormat,
          roundTo,
          useCache: argv.cache ?? true,
          inputFormat: watchFormat,
          onResult: ({ lat, lng, pin }) => {
            if (argv.json) {
              printJson({ lat, lng, pin, format: pinFormat });
            } else {
              console.log(chalk.cyan(pin));
            }
          },
          onError: (error, raw) => {
            console.error(chalk.red('Failed to encode input line:'), raw);
            console.error(error.message);
          },
        });
        return;
      }

      const lat = argv.lat as number;
      const lng = argv.lng as number;

      validateCoordinates(lat, lng);
      const pin = getDigiPin(lat, lng, {
        format: pinFormat,
        roundTo,
        useCache: argv.cache ?? true,
      });

      if (argv.json) {
        printJson({
          latitude: lat,
          longitude: lng,
          pin,
          format: pinFormat,
        });
        return;
      }

      if (argv.verbose) {
        console.log(chalk.green('\nInput Coordinates:'));
        console.log(formatCoords({ latitude: lat, longitude: lng }, argv.format));
        console.log(chalk.green('\nGenerated DIGIPIN:'), chalk.cyan(pin));
        console.log(chalk.green('\nDIGIPIN Format:'), 'XXX-XXX-XXXX');
        console.log(
          chalk.green('Valid Characters:'),
          'F,C,9,8,J,3,2,7,K,4,5,6,L,M,P,T'
        );
      } else {
        console.log(chalk.cyan('\nDIGIPIN:'), pin);
      }
    } catch (error) {
      handleError(error);
    }
  },
};

const decodeCommand: CommandModule<{}, DecodeArgs> = {
  command: 'decode',
  describe: 'Convert DIGIPIN to latitude/longitude',
  builder: (yargs: Argv<{}>): Argv<DecodeArgs> =>
    yargs
      .option('pin', {
        type: 'string',
        describe: 'DIGIPIN to decode (format: XXX-XXX-XXXX)',
      })
      .option('verbose', {
        type: 'boolean',
        default: false,
        describe: 'Show detailed information',
      })
      .option('json', {
        type: 'boolean',
        default: false,
        describe: 'Emit JSON output',
      })
      .option('format', {
        alias: 'f',
        type: 'string',
        choices: ['degrees', 'dms', 'geojson'],
        default: 'degrees',
        describe: 'Output format (degrees, dms, or geojson)',
      })
      .option('cache', {
        type: 'boolean',
        default: true,
        describe: 'Enable decode cache',
      })
      .option('watch', {
        type: 'boolean',
        default: false,
        describe: 'Read DIGIPINs from stdin (one per line)',
      })
      .check((argv) => {
        if (!argv.watch && !argv.pin) {
          throw new Error('pin is required unless --watch is enabled');
        }
        return true;
      }) as Argv<DecodeArgs>,
  handler: (argv) => {
    try {
      if (argv.watch) {
        watchDecodeStream(process.stdin, {
          useCache: argv.cache ?? true,
          onResult: ({ pin, latitude, longitude }) => {
            if (argv.json) {
              if (argv.format === 'geojson') {
                printJson(toGeoJson(pin, {}, { useCache: argv.cache ?? true }));
              } else {
                printJson({ pin, latitude, longitude });
              }
            } else {
              if (argv.format === 'geojson') {
                printJson(toGeoJson(pin, {}, { useCache: argv.cache ?? true }), true);
              } else {
                console.log(
                  formatCoords({ latitude, longitude }, (argv.format ?? 'degrees') as OutputFormat)
                );
              }
            }
          },
          onError: (error, raw) => {
            console.error(chalk.red('Failed to decode input line:'), raw);
            console.error(error.message);
          },
        });
        return;
      }

      const pin = argv.pin as string;
      normalizeDigiPin(pin);
      const coords = getLatLngFromDigiPin(pin, {
        useCache: argv.cache ?? true,
      } as DecodeOptions);

      if (argv.json) {
        if (argv.format === 'geojson') {
          printJson(toGeoJson(pin, {}, { useCache: argv.cache ?? true }), argv.verbose);
        } else {
          printJson({ pin, ...coords }, argv.verbose);
        }
      } else {
        if (argv.format === 'geojson') {
          printJson(toGeoJson(pin, {}, { useCache: argv.cache ?? true }), true);
        } else {
          console.log(chalk.green('\nCoordinates:'));
          console.log(formatCoords(coords, argv.format as OutputFormat));
        }
      }
    } catch (error) {
      handleError(error);
    }
  },
};

const batchEncodeCommand: CommandModule<{}, BatchEncodeArgs> = {
  command: 'batch-encode <file>',
  describe: 'Batch encode coordinates from a JSON file',
  builder: (yargs: Argv<{}>): Argv<BatchEncodeArgs> =>
    yargs
      .positional('file', {
        type: 'string',
        describe: 'Path to JSON file (array of { lat, lng })',
        demandOption: true,
      })
      .option('json', {
        type: 'boolean',
        default: false,
        describe: 'Emit JSON output',
      })
      .option('pin-format', {
        type: 'string',
        choices: ['hyphenated', 'compact'],
        default: 'hyphenated',
        describe: 'DIGIPIN output format',
      })
      .option('round', {
        type: 'number',
        describe: 'Round coordinates to the specified decimals before encoding (default: 6)',
      })
      .option('no-round', {
        type: 'boolean',
        default: false,
        describe: 'Disable coordinate rounding',
      })
      .option('cache', {
        type: 'boolean',
        default: true,
        describe: 'Enable encode cache',
      }) as Argv<BatchEncodeArgs>,
  handler: (argv) => {
    try {
      const data = loadJsonFile(argv.file);
      if (!Array.isArray(data)) {
        throw new Error('Batch encode file must contain an array of coordinates');
      }
      const pinFormat = (argv.pinFormat ?? 'hyphenated') as DigiPinFormat;
      const roundTo = argv.noRound ? 'none' : argv.round ?? 6;
      const encodeOptions: EncodeOptions = {
        format: pinFormat,
        roundTo,
        useCache: argv.cache ?? true,
      };
      const pins = batchEncode(
        data.map((entry) => {
          if (typeof entry !== 'object' || entry === null) {
            throw new Error('Each coordinate must be an object with lat and lng');
          }
          const lat = (entry as { lat?: number; latitude?: number }).lat ?? (entry as { latitude?: number }).latitude;
          const lng =
            (entry as { lng?: number; longitude?: number }).lng ?? (entry as { longitude?: number }).longitude;
          if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new Error('Coordinate entries must contain numeric lat/lng');
          }
          validateCoordinates(lat, lng);
          return { lat, lng };
        }),
        encodeOptions
      );

      if (argv.json) {
        printJson(pins);
      } else {
        pins.forEach((pin) => console.log(pin));
      }
    } catch (error) {
      handleError(error);
    }
  },
};

const batchDecodeCommand: CommandModule<{}, BatchDecodeArgs> = {
  command: 'batch-decode <file>',
  describe: 'Batch decode DIGIPINs from a JSON file',
  builder: (yargs: Argv<{}>): Argv<BatchDecodeArgs> =>
    yargs
      .positional('file', {
        type: 'string',
        describe: 'Path to JSON file (array of DIGIPIN strings)',
        demandOption: true,
      })
      .option('json', {
        type: 'boolean',
        default: false,
        describe: 'Emit JSON output',
      })
      .option('cache', {
        type: 'boolean',
        default: true,
        describe: 'Enable decode cache',
      }) as Argv<BatchDecodeArgs>,
  handler: (argv) => {
    try {
      const data = loadJsonFile(argv.file);
      if (!Array.isArray(data)) {
        throw new Error('Batch decode file must contain an array of DIGIPIN strings');
      }
      const pins = data.map((entry) => {
        if (typeof entry !== 'string') {
          throw new Error('Batch decode entries must be DIGIPIN strings');
        }
        normalizeDigiPin(entry);
        return entry;
      });

      const coords = batchDecode(pins, {
        useCache: argv.cache ?? true,
      } as DecodeOptions);

      if (argv.json) {
        printJson(coords);
      } else {
        coords.forEach((coord, index) => {
          console.log(chalk.green(`\n${pins[index]}`));
          console.log(formatCoords(coord));
        });
      }
    } catch (error) {
      handleError(error);
    }
  },
};

const distanceCommand: CommandModule<{}, DistanceArgs> = {
  command: 'distance',
  describe: 'Calculate distance (in meters) between two DIGIPINs',
  builder: (yargs: Argv<{}>): Argv<DistanceArgs> =>
    yargs
      .option('from', {
        type: 'string',
        describe: 'Start DIGIPIN',
        demandOption: true,
      })
      .option('to', {
        type: 'string',
        describe: 'End DIGIPIN',
        demandOption: true,
      })
      .option('precise', {
        type: 'boolean',
        default: false,
        describe: 'Use Vincenty algorithm for higher precision',
      })
      .option('accuracy', {
        type: 'number',
        default: 1,
        describe: 'Distance accuracy in meters (passed to geolib)',
      })
      .option('json', {
        type: 'boolean',
        default: false,
        describe: 'Emit JSON output',
      }) as Argv<DistanceArgs>,
  handler: (argv) => {
    try {
      normalizeDigiPin(argv.from);
      normalizeDigiPin(argv.to);
      const fn = argv.precise ? getPreciseDistanceBetween : getDistanceBetween;
      const distance = fn(argv.from, argv.to, argv.accuracy ?? 1);
      if (argv.json) {
        printJson({
          from: argv.from,
          to: argv.to,
          distance,
          precise: argv.precise ?? false,
          accuracy: argv.accuracy ?? 1,
        });
      } else {
        console.log(
          chalk.green(
            `Distance between ${chalk.cyan(argv.from)} and ${chalk.cyan(argv.to)}: ${chalk.yellow(
              `${distance} m`
            )}`
          )
        );
      }
    } catch (error) {
      handleError(error);
    }
  },
};

const nearestCommand: CommandModule<{}, NearestArgs> = {
  command: 'nearest',
  describe: 'Find the nearest DIGIPIN from a list relative to a reference pin',
  builder: (yargs: Argv<{}>): Argv<NearestArgs> =>
    yargs
      .option('reference', {
        type: 'string',
        describe: 'Reference DIGIPIN',
        demandOption: true,
      })
      .option('file', {
        type: 'string',
        describe: 'JSON file containing an array of DIGIPINs',
      })
      .option('pins', {
        type: 'string',
        describe: 'Comma separated list of DIGIPINs',
      })
      .option('accuracy', {
        type: 'number',
        default: 1,
        describe: 'Distance accuracy in meters (passed to geolib)',
      })
      .option('json', {
        type: 'boolean',
        default: false,
        describe: 'Emit JSON output',
      })
      .check((argv) => {
        if (!argv.file && !argv.pins) {
          throw new Error('You must provide either --file or --pins');
        }
        return true;
      }) as Argv<NearestArgs>,
  handler: (argv) => {
    try {
      normalizeDigiPin(argv.reference);
      let pinList: string[] = [];
      if (argv.file) {
        const data = loadJsonFile(argv.file);
        if (!Array.isArray(data) || data.some((entry) => typeof entry !== 'string')) {
          throw new Error('Nearest pins file must be an array of DIGIPIN strings');
        }
        pinList = data as string[];
      } else if (argv.pins) {
        pinList = argv.pins.split(',').map((pin) => pin.trim());
      }
      pinList.forEach((pin) => normalizeDigiPin(pin));
      const ordered = orderByDistance(argv.reference, pinList, {
        accuracy: argv.accuracy ?? 1,
      });
      const nearest = ordered[0];
      if (!nearest) {
        throw new Error('No pins available to compare');
      }
      const distance = getDistanceBetween(argv.reference, nearest, argv.accuracy ?? 1);
      if (argv.json) {
        printJson({
          reference: argv.reference,
          nearest,
          distance,
        });
      } else {
        console.log(
          chalk.green(
            `Nearest to ${chalk.cyan(argv.reference)} is ${chalk.cyan(
              nearest
            )} at ${chalk.yellow(`${distance} m`)}`
          )
        );
      }
    } catch (error) {
      handleError(error);
    }
  },
};

yargs(hideBin(process.argv))
  .scriptName('digipin-cli')
  .command(encodeCommand)
  .command(decodeCommand)
  .command(batchEncodeCommand)
  .command(batchDecodeCommand)
  .command(distanceCommand)
  .command(nearestCommand)
  .demandCommand(1, chalk.yellow('Please specify a command'))
  .strict()
  .help()
  .version()
  .epilog(
    chalk.gray('For more information, visit: https://github.com/rajatguptaa/digipinjs')
  )
  .argv;
