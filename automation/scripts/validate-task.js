#!/usr/bin/env node
/**
 * validate:task — post-implementation quick check.
 * Fast, deterministic, no server required.
 *
 * Sequence:
 *   1. Invariant scanner (static code analysis)
 *   2. TypeScript build (frontend + backend)
 *   3. Backend unit tests (vitest)
 *
 * Total expected time: <30s
 * Run after every non-trivial implementation task.
 */

import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { header, ok, fail, dim, writeReport, COLORS as C } from './report.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../');
const AUTOMATION = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(label, cmd, args, cwd) {
  dim(`→ ${label}`);
  const result = spawnSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`${label} failed`);
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    return false;
  }
  ok(label);
  return true;
}

header('Post-Task Validation');
console.log();

const results = [];
const start = Date.now();

// 1. Invariant scanner
dim('Step 1/3 — Invariant scanner');
const invResult = spawnSync(
  'node', ['scripts/validate-invariants.js'],
  { cwd: AUTOMATION, stdio: 'inherit', encoding: 'utf8' }
);
results.push({ step: 'invariants', ok: invResult.status === 0 });

// 2. TypeScript builds
console.log();
dim('Step 2/3 — TypeScript builds');
const buildBE = run('Backend build (tsc)', 'npm', ['run', 'build', '-w', 'backend'], ROOT);
const buildFE = run('Frontend build (tsc + vite)', 'npm', ['run', 'build', '-w', 'frontend'], ROOT);
results.push({ step: 'build-backend', ok: buildBE });
results.push({ step: 'build-frontend', ok: buildFE });

// 3. Backend unit tests
console.log();
dim('Step 3/3 — Backend unit tests');
const tests = run('Backend tests (vitest)', 'npm', ['run', 'test', '-w', 'backend'], ROOT);
results.push({ step: 'tests', ok: tests });

// Summary
const elapsed = ((Date.now() - start) / 1000).toFixed(1);
const allPassed = results.every(r => r.ok);
const passed = results.filter(r => r.ok).length;

console.log(`\n${'─'.repeat(44)}`);
if (allPassed) {
  console.log(`${C.green}${C.bold}✓ All checks passed (${elapsed}s)${C.reset}`);
} else {
  console.log(`${C.red}${C.bold}✗ ${results.length - passed}/${results.length} checks failed (${elapsed}s)${C.reset}`);
}

writeReport('task-validation.json', {
  ts: new Date().toISOString(),
  elapsed: `${elapsed}s`,
  passed,
  total: results.length,
  steps: results,
});

if (!allPassed) process.exit(1);
