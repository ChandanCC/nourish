#!/usr/bin/env node
/**
 * validate — runs the complete validation suite.
 *
 * Order (fail-fast):
 *   1. Invariants (always)
 *   2. TypeScript builds (always)
 *   3. Backend tests (always)
 *   4. Smoke checks (needs built frontend)
 *   5. Replay flows (needs running server)
 *   6. Visual drift (needs running server, skippable)
 *
 * Skip visual with: SKIP_VISUAL=1 npm run validate
 */

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { header, ok, fail, dim, writeReport, COLORS as C } from './report.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../');
const AUTO = join(dirname(fileURLToPath(import.meta.url)), '..');

function step(name, script) {
  console.log();
  const result = spawnSync('node', [`scripts/${script}`], {
    cwd: AUTO, stdio: 'inherit', encoding: 'utf8', env: { ...process.env },
  });
  return result.status === 0;
}

console.log(`\n${C.bold}${C.cyan}╔══ Nouriq Full Validation Suite ══╗${C.reset}`);

const start = Date.now();
const results = [];

results.push({ name: 'invariants',  ok: step('Invariants',      'validate-invariants.js') });
if (!results.at(-1).ok) { exitWith(results, start); }

// Fast checks (no server)
const buildBE = spawnSync('npm', ['run', 'build', '-w', 'backend'], { cwd: ROOT, stdio: 'pipe' });
const buildFE = spawnSync('npm', ['run', 'build', '-w', 'frontend'], { cwd: ROOT, stdio: 'pipe' });
const tests   = spawnSync('npm', ['run', 'test', '-w', 'backend'], { cwd: ROOT, stdio: 'pipe' });
results.push({ name: 'build-backend',  ok: buildBE.status === 0 });
results.push({ name: 'build-frontend', ok: buildFE.status === 0 });
results.push({ name: 'backend-tests',  ok: tests.status === 0 });

if (buildBE.status !== 0) { process.stderr.write(buildBE.stderr?.toString() ?? ''); }
if (buildFE.status !== 0) { process.stderr.write(buildFE.stderr?.toString() ?? ''); }
if (tests.status !== 0)   { process.stderr.write(tests.stderr?.toString() ?? ''); }

results.push({ name: 'smoke',  ok: step('Smoke',  'validate-smoke.js') });
results.push({ name: 'replay', ok: step('Replay', 'validate-replay.js') });

if (process.env.SKIP_VISUAL !== '1') {
  results.push({ name: 'visual', ok: step('Visual', 'validate-visual.js') });
} else {
  dim('Visual drift skipped (SKIP_VISUAL=1)');
}

exitWith(results, start);

function exitWith(results, start) {
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const passed = results.filter(r => r.ok).length;
  const total  = results.length;

  console.log(`\n${C.bold}${'─'.repeat(44)}${C.reset}`);
  for (const r of results) {
    const icon = r.ok ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
    console.log(`  ${icon}  ${r.name}`);
  }
  console.log(`\n${passed === total ? C.green : C.red}${C.bold}${passed}/${total} passed · ${elapsed}s${C.reset}\n`);

  writeReport('validation-summary.json', {
    ts: new Date().toISOString(), elapsed: `${elapsed}s`, passed, total, results,
  });

  if (passed < total) process.exit(1);
}
