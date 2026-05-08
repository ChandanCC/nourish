/**
 * Report formatter — shared output utilities.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const REPORTS_DIR = new URL('../reports/', import.meta.url).pathname;

export const COLORS = {
  reset:  '\x1b[0m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
  bold:   '\x1b[1m',
};

const C = COLORS;

export function header(title) {
  console.log(`\n${C.bold}${C.cyan}── ${title} ${C.reset}`);
}

export function ok(msg) {
  console.log(`  ${C.green}✓${C.reset}  ${msg}`);
}

export function warn(msg) {
  console.log(`  ${C.yellow}⚠${C.reset}  ${msg}`);
}

export function fail(msg) {
  console.log(`  ${C.red}✗${C.reset}  ${msg}`);
}

export function dim(msg) {
  console.log(`  ${C.dim}${msg}${C.reset}`);
}

export function summary(label, passed, total) {
  const color = passed === total ? C.green : passed > 0 ? C.yellow : C.red;
  console.log(`\n${color}${C.bold}${label}: ${passed}/${total} passed${C.reset}`);
}

export function writeReport(filename, data) {
  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(join(REPORTS_DIR, filename), JSON.stringify(data, null, 2));
}

export function printViolation(v) {
  const icon = v.severity === 'error' ? `${C.red}✗${C.reset}` : `${C.yellow}⚠${C.reset}`;
  console.log(`  ${icon} [${v.rule}] ${v.file}:${v.line}`);
  console.log(`     ${C.dim}${v.description}${C.reset}`);
  console.log(`     ${C.dim}→ ${v.excerpt}${C.reset}`);
}
