#!/usr/bin/env node
/**
 * validate:invariants — static code scanner
 * Runs in <1s. No server required. Always deterministic.
 */

import { scan } from '../invariants/scanner.js';
import { header, ok, fail, warn, printViolation, summary, writeReport, dim, COLORS as C } from './report.js';

header('Invariant Scanner');

const { errors, warnings, scanned } = scan();

if (errors.length === 0 && warnings.length === 0) {
  ok(`All invariants held (${scanned} files scanned)`);
} else {
  dim(`Scanned ${scanned} file passes`);

  if (errors.length > 0) {
    console.log(`\n${C.bold}Errors (must fix):${C.reset}`);
    for (const v of errors) printViolation(v);
  }

  if (warnings.length > 0) {
    console.log(`\n${C.bold}Warnings (should fix):${C.reset}`);
    for (const v of warnings) printViolation(v);
  }
}

const report = {
  ts: new Date().toISOString(),
  scanned,
  errors: errors.length,
  warnings: warnings.length,
  violations: [...errors, ...warnings],
};
writeReport('invariants.json', report);

const total = errors.length + warnings.length;
summary('Invariants', total === 0 ? 1 : warnings.length, errors.length + warnings.length === 0 ? 1 : errors.length + warnings.length);

if (errors.length > 0) {
  console.log(`\n${C.red}${C.bold}${errors.length} error(s) — fix before proceeding.${C.reset}\n`);
  process.exit(1);
}

if (warnings.length > 0) {
  console.log(`\n${C.yellow}${warnings.length} warning(s) — review when possible.${C.reset}\n`);
}
