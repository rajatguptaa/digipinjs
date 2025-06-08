#!/bin/bash

echo "DigiPIN CLI Examples"
echo "==================="
echo

echo "1. Basic Usage:"
echo "--------------"
echo "a) Delhi coordinates (default output):"
node dist/cli.js encode --lat 28.6139 --lng 77.2090
echo

echo "b) Delhi coordinates (verbose output):"
node dist/cli.js encode --lat 28.6139 --lng 77.2090 --verbose
echo

echo "c) Delhi coordinates (verbose output with DMS format):"
node dist/cli.js encode --lat 28.6139 --lng 77.2090 --verbose --format dms
echo

echo "2. Decoding Examples:"
echo "-------------------"
echo "a) Decode a valid pin (default output):"
node dist/cli.js decode --pin FC9-8J3-27K4
echo

echo "b) Decode a valid pin (verbose output):"
node dist/cli.js decode --pin FC9-8J3-27K4 --verbose
echo

echo "c) Decode a valid pin (verbose output with DMS format):"
node dist/cli.js decode --pin FC9-8J3-27K4 --verbose --format dms
echo

echo "3. Error Cases:"
echo "-------------"
echo "a) Invalid latitude (too high):"
node dist/cli.js encode --lat 100 --lng 77.2090
echo

echo "b) Invalid latitude (too low):"
node dist/cli.js encode --lat 1 --lng 77.2090
echo

echo "c) Invalid longitude (too high):"
node dist/cli.js encode --lat 28.6139 --lng 200
echo

echo "d) Invalid longitude (too low):"
node dist/cli.js encode --lat 28.6139 --lng 50
echo

echo "e) Invalid pin format (wrong length):"
node dist/cli.js decode --pin FC9-8J3
echo

echo "f) Invalid pin characters:"
node dist/cli.js decode --pin INVALID-PIN
echo

echo "4. Help Information:"
echo "------------------"
node dist/cli.js --help
echo

echo "5. Version Information:"
echo "---------------------"
node dist/cli.js --version 