# P07-006 — AI Instruction Display

**Phase:** 07 — Frontend–Backend Integration
**Complexity:** S (<1h)
**Status:** NOT_STARTED
**Depends on:** P07-004, P06-003
**Unlocks:** (feature complete)

---

## Purpose

Render the `aiInstruction` string from SignalState in the TODAY zone when it is present.

## Why It Exists

The AI synthesis layer (Tier 3) produces a single actionable instruction string. It needs to be displayed in the UI once it exists in the payload.

## Exact Scope

- In `TodayZone.tsx`: render `signal.aiInstruction` below the macro rows if non-null
- Display as a single line in DM Mono, using INK token (not a special color)
- No label, no icon — just the instruction text
- If `aiInstruction` is null, render nothing (no placeholder, no empty space)

## Out of Scope

- How the AI instruction is computed (Phase 06)
- Any interactivity on the instruction text

## Files Expected to Change

```
frontend/src/components/TodayZone.tsx   (add aiInstruction rendering)
```

## Design-System Constraints

- DM Mono, `--ink-2` opacity (secondary text)
- No special styling, no quotes, no italics
- `aiInstruction` is null → render nothing (not an empty div)

## Acceptance Criteria

1. When `aiInstruction` is non-null, it renders below macro rows
2. When `aiInstruction` is null, nothing renders (no placeholder)
3. Text uses DM Mono and INK token
4. Build passes

## Estimated Complexity

S — <30 minutes.

## Claude Execution Guidance

Single conditional render: `{signal.aiInstruction && <p className="ai-instruction">{signal.aiInstruction}</p>}`. Add the CSS class to index.css with DM Mono and ink-2 color. Done.
