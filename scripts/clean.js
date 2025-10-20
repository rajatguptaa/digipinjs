#!/usr/bin/env node
const { rmSync } = require('fs');
const { resolve } = require('path');

const distPath = resolve(__dirname, '../dist');

rmSync(distPath, { recursive: true, force: true });
