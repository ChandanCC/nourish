/**
 * Invariant rule definitions.
 * Each rule: { id, category, severity, description, globs, check }
 * check(filePath, lines, content) => Violation[]
 * Violation: { line, col, excerpt }
 */

// ── helpers ───────────────────────────────────────────────────────────────────

function matchAll(content, pattern, filePath) {
  const violations = [];
  const lines = content.split('\n');
  lines.forEach((text, i) => {
    const re = new RegExp(pattern, 'gi');
    let m;
    while ((m = re.exec(text)) !== null) {
      violations.push({ line: i + 1, col: m.index + 1, excerpt: text.trim().slice(0, 120) });
    }
  });
  return violations;
}

function isComment(text) {
  const t = text.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
}

function matchLinesWhere(content, predicate) {
  const violations = [];
  content.split('\n').forEach((text, i) => {
    if (!isComment(text) && predicate(text)) {
      violations.push({ line: i + 1, col: 1, excerpt: text.trim().slice(0, 120) });
    }
  });
  return violations;
}

// ── rules ─────────────────────────────────────────────────────────────────────

export const RULES = [

  // ── Visual discipline ──────────────────────────────────────────────────────

  {
    id: 'V-001',
    category: 'visual',
    severity: 'error',
    description: 'box-shadow is prohibited — use BG elevation steps instead',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.css'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t => /box-shadow/.test(t));
    },
  },

  {
    id: 'V-002',
    category: 'visual',
    severity: 'error',
    description: 'backdrop-filter is prohibited — no glassmorphism',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.css', 'frontend/src/**/*.ts'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t => /backdrop-filter/.test(t));
    },
  },

  {
    id: 'V-003',
    category: 'visual',
    severity: 'warning',
    description: 'Hardcoded hex color in component — use CSS custom property (var(--token))',
    globs: ['frontend/src/**/*.tsx'],
    check(filePath, _lines, content) {
      // Matches #rgb or #rrggbb (not in import paths or URLs)
      return matchLinesWhere(content, t =>
        !isComment(t) && /#[0-9a-fA-F]{3,8}(?:[^0-9a-fA-F]|$)/.test(t)
      );
    },
  },

  {
    id: 'V-004',
    category: 'visual',
    severity: 'warning',
    description: 'Linear gradient on structural element — verify it is intentional (allowed: HomeScreen gradient fade)',
    globs: ['frontend/src/**/*.tsx'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t =>
        /linear-gradient/.test(t) && !filePath.includes('HomeScreen')
      );
    },
  },

  {
    id: 'V-005',
    category: 'visual',
    severity: 'error',
    description: 'text-shadow is prohibited',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.css'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t => /text-shadow/.test(t));
    },
  },

  // ── Product voice ──────────────────────────────────────────────────────────

  {
    id: 'P-001',
    category: 'product',
    severity: 'error',
    description: 'Praise / motivational language detected — copy must be operational',
    globs: ['frontend/src/**/*.tsx'],
    check(filePath, _lines, content) {
      const patterns = [
        /great\s+job/i,
        /nice\s+work/i,
        /keep\s+(it\s+up|going)/i,
        /you.re\s+crushing/i,
        /well\s+done/i,
        /you.re\s+doing\s+(great|amazing|awesome)/i,
        /stay\s+hydrated/i,
        /crushing\s+it/i,
      ];
      return matchLinesWhere(content, t =>
        !isComment(t) && patterns.some(p => p.test(t))
      );
    },
  },

  {
    id: 'P-002',
    category: 'product',
    severity: 'error',
    description: 'Gamification pattern detected — no streaks, badges, confetti, achievements',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.ts'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t =>
        !isComment(t) && /\b(confetti|streak|badge|achievement|trophy|milestone|level\s+up|points?)\b/i.test(t)
      );
    },
  },

  {
    id: 'P-003',
    category: 'product',
    severity: 'warning',
    description: 'Emoji literal in component — UI should use text labels only',
    globs: ['frontend/src/**/*.tsx'],
    check(filePath, _lines, content) {
      // Emoji-specific Unicode ranges only; exclude symbols, dingbats, arrows, math
      // Allowed: ▲▼↓→·✕✓✗ (symbols with clear semantic meaning in instrument UI)
      return matchLinesWhere(content, t =>
        !isComment(t) &&
        /[\u{1F300}-\u{1FFFF}]|[\u{1F600}-\u{1F64F}]|[\u{1F900}-\u{1F9FF}]/u.test(t)
      );
    },
  },

  // ── Security / boundary ────────────────────────────────────────────────────

  {
    id: 'A-001',
    category: 'security',
    severity: 'error',
    description: 'Anthropic API key or SDK referenced in frontend — must stay backend-only',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.ts'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t =>
        !isComment(t) && (
          /ANTHROPIC_API_KEY/.test(t) ||
          /@anthropic-ai\/sdk/.test(t) ||
          /from\s+['"]anthropic['"]/i.test(t)
        )
      );
    },
  },

  {
    id: 'A-002',
    category: 'security',
    severity: 'error',
    description: 'JWT_SECRET referenced in frontend — must stay backend-only',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.ts'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t =>
        !isComment(t) && /JWT_SECRET/.test(t)
      );
    },
  },

  {
    id: 'A-003',
    category: 'security',
    severity: 'error',
    description: 'ANTHROPIC_API_KEY must not appear in backend logs or response bodies',
    globs: ['backend/src/**/*.ts'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t =>
        !isComment(t) &&
        /console\.(log|info|warn|error).*ANTHROPIC_API_KEY/.test(t)
      );
    },
  },

  // ── Architecture ───────────────────────────────────────────────────────────

  {
    id: 'B-001',
    category: 'architecture',
    severity: 'error',
    description: 'Direct API call to /analyse outside api/client.ts — must route through the client',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.ts'],
    check(filePath, _lines, content) {
      if (filePath.includes('api/client.ts') || filePath.includes('lib/nutrition.ts')) return [];
      return matchLinesWhere(content, t =>
        !isComment(t) && /['"]\/api\/analyse['"]/.test(t)
      );
    },
  },

  {
    id: 'B-002',
    category: 'architecture',
    severity: 'warning',
    description: 'TypeScript `any` without suppression comment — add // eslint-disable or explicit type',
    globs: ['frontend/src/**/*.tsx', 'frontend/src/**/*.ts', 'backend/src/**/*.ts'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t =>
        !isComment(t) &&
        /:\s*any\b/.test(t) &&
        !/\/\/.*any/.test(t) &&
        !/\/\/\s*eslint-disable/.test(t) &&
        // catch (err: any) is idiomatic TypeScript — not a design violation
        !t.trim().startsWith('} catch')
      );
    },
  },

  {
    id: 'B-003',
    category: 'architecture',
    severity: 'error',
    description: 'Anthropic client called directly in a route handler — must be in a service (tier3.ts)',
    globs: ['backend/src/routes/**/*.ts'],
    check(filePath, _lines, content) {
      return matchLinesWhere(content, t =>
        !isComment(t) && (
          /new\s+Anthropic\b/.test(t) ||
          /client\.messages\.create/.test(t)
        )
      );
    },
  },

  {
    id: 'B-004',
    category: 'architecture',
    severity: 'error',
    description: 'FoodEntry query without isDeleted:false filter — soft-delete contract violation',
    globs: ['backend/src/**/*.ts'],
    check(filePath, _lines, content) {
      // Detect FoodEntry.find without isDeleted
      const hasFoodEntryFind = /FoodEntry\.(find|findOne)\(/.test(content);
      if (!hasFoodEntryFind) return [];
      const lines = content.split('\n');
      const violations = [];
      for (let i = 0; i < lines.length; i++) {
        const t = lines[i];
        if (!isComment(t) && /FoodEntry\.(find|findOne)\(/.test(t)) {
          // Check surrounding context (±3 lines) for isDeleted or invariant-exception comment
          const ctx = lines.slice(Math.max(0, i - 1), i + 4).join('\n');
          if (!/isDeleted/.test(ctx) && !/invariant-exception/.test(ctx)) {
            violations.push({ line: i + 1, col: 1, excerpt: t.trim().slice(0, 120) });
          }
        }
      }
      return violations;
    },
  },

];
