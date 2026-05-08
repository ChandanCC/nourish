#!/usr/bin/env node
/**
 * validate:replay — behavioral flow replay via Playwright.
 *
 * Unauthenticated flows always run.
 * Authenticated flows require TEST_TOKEN environment variable.
 */

import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { header, ok, fail, dim, warn, writeReport, COLORS as C } from './report.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

header('Behavioral Replay');

if (!process.env.TEST_TOKEN) {
  dim('TEST_TOKEN not set — authenticated flows will be skipped');
  dim('Unauthenticated flows (auth-wall) will run');
}

try {
  execFileSync(
    'npx', ['playwright', 'test', '--config', 'playwright.config.js', 'replay/'],
    { cwd: ROOT, stdio: 'inherit', env: { ...process.env } }
  );
  ok('All replay flows passed');
  writeReport('replay.json', { ts: new Date().toISOString(), status: 'passed' });
} catch {
  fail('Replay flows failed — see output above');
  writeReport('replay.json', { ts: new Date().toISOString(), status: 'failed' });
  console.log(`\n${C.red}${C.bold}Behavioral replay failed.${C.reset}\n`);
  process.exit(1);
}
