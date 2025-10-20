import path from 'path';
import { spawnSync } from 'child_process';
import { expect } from 'chai';

const CLI_ENTRY = path.resolve(__dirname, '../../src/cli.ts');
const EXEC = process.execPath;

function runCli(args: string[]): string {
  const result = spawnSync(
    EXEC,
    ['-r', 'ts-node/register', CLI_ENTRY, ...args],
    {
      cwd: path.resolve(__dirname, '../../'),
      env: {
        ...process.env,
        FORCE_COLOR: '0',
      },
      encoding: 'utf8',
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `CLI exited with code ${result.status}`);
  }

  return result.stdout.trim();
}

describe('digipin CLI', () => {
  it('encodes coordinates to DIGIPIN with JSON output', () => {
    const stdout = runCli([
      'encode',
      '--lat',
      '28.6139',
      '--lng',
      '77.2090',
      '--json',
    ]);
    const result = JSON.parse(stdout);
    expect(result.pin).to.equal('39J-438-TJC7');
  });

  it('decodes DIGIPIN to coordinates', () => {
    const stdout = runCli([
      'decode',
      '--pin',
      '39J-438-TJC7',
      '--json',
    ]);
    const result = JSON.parse(stdout);
    expect(result.latitude).to.be.closeTo(28.6139, 0.1);
    expect(result.longitude).to.be.closeTo(77.209, 0.1);
  });

  it('calculates distance between DIGIPINs', () => {
    const stdout = runCli([
      'distance',
      '--from',
      '39J-438-TJC7',
      '--to',
      '4FK-595-8823',
      '--json',
    ]);
    const result = JSON.parse(stdout);
    expect(result.distance).to.be.greaterThan(1100000);
  });
});
