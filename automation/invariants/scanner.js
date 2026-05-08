/**
 * Invariant scanner — static code analysis against architecture rules.
 * No external dependencies. Pure Node.js.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { RULES } from './rules.js';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');

// ── file walker ───────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// ── glob matcher (simple — supports ** and *) ─────────────────────────────────

function matchGlob(filePath, pattern) {
  const relPath = relative(ROOT, filePath).replace(/\\/g, '/');
  const regexSrc = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§DSTAR§')
    .replace(/\*/g, '[^/]*')
    .replace(/§DSTAR§/g, '.*');
  return new RegExp(`^${regexSrc}$`).test(relPath);
}

// ── scanner ───────────────────────────────────────────────────────────────────

export function scan() {
  const allFiles = walk(ROOT);
  const results = { errors: [], warnings: [], scanned: 0 };

  for (const rule of RULES) {
    const matchingFiles = allFiles.filter(f =>
      rule.globs.some(g => matchGlob(f, g))
    );

    for (const filePath of matchingFiles) {
      results.scanned++;
      let content;
      try { content = readFileSync(filePath, 'utf8'); }
      catch { continue; }

      const lines = content.split('\n');
      const violations = rule.check(filePath, lines, content);

      for (const v of violations) {
        const entry = {
          rule: rule.id,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          file: relative(ROOT, filePath),
          line: v.line,
          col: v.col,
          excerpt: v.excerpt,
        };
        if (rule.severity === 'error') results.errors.push(entry);
        else results.warnings.push(entry);
      }
    }
  }

  return results;
}
