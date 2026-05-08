#!/usr/bin/env node
/**
 * validate:smoke — run Playwright smoke checks.
 * Requires frontend running (starts preview server automatically).
 */

import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { header, ok, fail, writeReport, COLORS as C } from './report.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

header('Smoke Checks');

try {
  execFileSync(
    'npx', ['playwright', 'test', '--config', 'playwright.config.js', 'smoke/'],
    { cwd: ROOT, stdio: 'inherit', env: { ...process.env } }
  );
  ok('All smoke checks passed');
  writeReport('smoke.json', { ts: new Date().toISOString(), status: 'passed' });
} catch {
  fail('Smoke checks failed — see output above');
  writeReport('smoke.json', { ts: new Date().toISOString(), status: 'failed' });
  console.log(`\n${C.red}${C.bold}Smoke checks failed.${C.reset}\n`);
  process.exit(1);
}
