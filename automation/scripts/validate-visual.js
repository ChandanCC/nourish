#!/usr/bin/env node
/**
 * validate:visual — visual drift detection via Playwright screenshots.
 *
 * First run: --update-snapshots saves baselines.
 * Subsequent runs: diffs against stored baselines.
 *
 * Set UPDATE=1 to force baseline update: UPDATE=1 npm run validate:visual
 */

import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { header, ok, fail, dim, writeReport, COLORS as C } from './report.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const update = process.env.UPDATE === '1';

header('Visual Drift Detection');

if (update) {
  dim('Mode: updating baselines');
} else {
  dim('Mode: comparing against baselines (set UPDATE=1 to refresh)');
}

const args = ['playwright', 'test', '--config', 'playwright.config.js', 'visual/'];
if (update) args.push('--update-snapshots');

try {
  execFileSync('npx', args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env } });
  ok(update ? 'Baselines updated' : 'No visual drift detected');
  writeReport('visual.json', { ts: new Date().toISOString(), status: update ? 'updated' : 'passed' });
} catch {
  fail('Visual drift detected — review diffs in reports/playwright-results/');
  writeReport('visual.json', { ts: new Date().toISOString(), status: 'failed' });
  console.log(`\n${C.yellow}Run: UPDATE=1 npm run validate:visual  to accept changes as new baseline.${C.reset}\n`);
  process.exit(1);
}
