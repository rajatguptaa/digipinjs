#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getDigiPin, getLatLngFromDigiPin } from './core';
import type { ArgumentsCamelCase, CommandModule, Argv } from 'yargs';
import chalk from 'chalk';

interface EncodeArgs extends ArgumentsCamelCase {
  lat: number;
  lng: number;
  verbose?: boolean;
  format?: 'degrees' | 'dms';
}

interface DecodeArgs extends ArgumentsCamelCase {
  pin: string;
  verbose?: boolean;
  format?: 'degrees' | 'dms';
}

// Helper function to convert decimal degrees to DMS
function toDMS(decimal: number, isLatitude: boolean): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  const direction = isLatitude 
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

// Helper function to format coordinates
function formatCoords(coords: { latitude: number; longitude: number }, format: 'degrees' | 'dms' = 'degrees'): string {
  if (format === 'dms') {
    return `Latitude: ${toDMS(coords.latitude, true)}\nLongitude: ${toDMS(coords.longitude, false)}`;
  }
  return `Latitude: ${chalk.cyan(coords.latitude.toFixed(6))}°\nLongitude: ${chalk.cyan(coords.longitude.toFixed(6))}°`;
}

// Helper function to handle errors
function handleError(error: Error): void {
  console.error(chalk.red('\nError:'), error.message);
  if (error.message === 'Latitude out of range') {
    console.error(chalk.yellow('Valid latitude range is 2.5° to 38.5°'));
  } else if (error.message === 'Longitude out of range') {
    console.error(chalk.yellow('Valid longitude range is 63.5° to 99.5°'));
  } else if (error.message === 'Invalid DIGIPIN') {
    console.error(chalk.yellow('DIGIPIN must be 10 characters long (excluding hyphens)'));
    console.error(chalk.yellow('Format: XXX-XXX-XXXX where X is one of: F,C,9,8,J,3,2,7,K,4,5,6,L,M,P,T'));
  } else if (error.message === 'Invalid character') {
    console.error(chalk.yellow('DIGIPIN can only contain these characters: F,C,9,8,J,3,2,7,K,4,5,6,L,M,P,T'));
  }
  process.exit(1);
}

// Helper function to validate coordinates
function validateCoordinates(lat: number, lng: number): void {
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid coordinates: must be numbers');
  }
  if (lat < 2.5 || lat > 38.5) {
    throw new Error('Latitude out of range');
  }
  if (lng < 63.5 || lng > 99.5) {
    throw new Error('Longitude out of range');
  }
}

const encodeCommand: CommandModule<{}, EncodeArgs> = {
  command: 'encode',
  describe: 'Convert latitude/longitude to DIGIPIN',
  builder: (yargs: Argv<{}>): Argv<EncodeArgs> => {
    return yargs
      .option('lat', {
        type: 'number',
        demandOption: true,
        describe: 'Latitude (2.5° to 38.5°)'
      })
      .option('lng', {
        type: 'number',
        demandOption: true,
        describe: 'Longitude (63.5° to 99.5°)'
      })
      .option('verbose', {
        type: 'boolean',
        default: false,
        describe: 'Show detailed information'
      })
      .option('format', {
        type: 'string',
        choices: ['degrees', 'dms'],
        default: 'degrees',
        describe: 'Coordinate format for verbose output'
      }) as Argv<EncodeArgs>;
  },
  handler: (argv) => {
    try {
      validateCoordinates(argv.lat, argv.lng);
      const pin = getDigiPin(argv.lat, argv.lng);
      
      if (argv.verbose) {
        console.log(chalk.green('\nInput Coordinates:'));
        console.log(formatCoords({ latitude: argv.lat, longitude: argv.lng }, argv.format));
        console.log(chalk.green('\nGenerated DIGIPIN:'), chalk.cyan(pin));
        console.log(chalk.green('\nDIGIPIN Format:'), 'XXX-XXX-XXXX');
        console.log(chalk.green('Valid Characters:'), 'F,C,9,8,J,3,2,7,K,4,5,6,L,M,P,T');
      } else {
        console.log(chalk.cyan('\nDIGIPIN:'), pin);
      }
    } catch (error) {
      handleError(error as Error);
    }
  }
};

const decodeCommand: CommandModule<{}, DecodeArgs> = {
  command: 'decode',
  describe: 'Convert DIGIPIN to latitude/longitude',
  builder: (yargs: Argv<{}>): Argv<DecodeArgs> => {
    return yargs
      .option('pin', {
        type: 'string',
        demandOption: true,
        describe: 'DIGIPIN to decode (format: XXX-XXX-XXXX)'
      })
      .option('verbose', {
        type: 'boolean',
        default: false,
        describe: 'Show detailed information'
      })
      .option('format', {
        type: 'string',
        choices: ['degrees', 'dms'],
        default: 'degrees',
        describe: 'Coordinate format for output'
      }) as Argv<DecodeArgs>;
  },
  handler: (argv) => {
    try {
      if (argv.verbose) {
        console.log(chalk.green('\nInput DIGIPIN:'), chalk.cyan(argv.pin));
        console.log(chalk.green('DIGIPIN Format:'), 'XXX-XXX-XXXX');
        console.log(chalk.green('Valid Characters:'), 'F,C,9,8,J,3,2,7,K,4,5,6,L,M,P,T');
      }
      
      const coords = getLatLngFromDigiPin(argv.pin);
      
      if (argv.verbose) {
        console.log(chalk.green('\nDecoded Coordinates:'));
        console.log(formatCoords(coords, argv.format));
        console.log(chalk.green('\nCoordinate Bounds:'));
        console.log(chalk.yellow('Latitude:'), '2.5° to 38.5°');
        console.log(chalk.yellow('Longitude:'), '63.5° to 99.5°');
      } else {
        console.log(chalk.green('\nCoordinates:'));
        console.log(formatCoords(coords, argv.format));
      }
    } catch (error) {
      handleError(error as Error);
    }
  }
};

// Main CLI implementation
yargs(hideBin(process.argv))
  .command(encodeCommand)
  .command(decodeCommand)
  .demandCommand(1, chalk.yellow('Please specify a command: encode or decode'))
  .help()
  .version()
  .epilog(chalk.gray('For more information, visit: https://github.com/your-org/digipin-wrapper'))
  .argv;