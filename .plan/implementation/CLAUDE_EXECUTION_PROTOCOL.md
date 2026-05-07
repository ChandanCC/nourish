# Claude Execution Protocol

**How every Claude session in this repository operates during implementation.**
**Last updated:** 2026-05-07

This protocol is optimized for: low context loss between sessions, high implementation fidelity, and low token usage per session.

---

## Session Start (Every Session)

**Step 1 — Orientation (2 min, ~1500 tokens)**

Read exactly these files, in order:
```
1. CLAUDE.md                                    → non-negotiables
2. .plan/implementation/PROGRESS.md             → where we are now
3. .plan/implementation/TASK_REGISTER.md        → task status overview
```

Do not read more than this unless the task requires it. These three files give you:
- The rules you must follow
- The current implementation state
- The next task to execute

**Step 2 — Load the task (3 min, ~2000 tokens)**

Read the task file for the current active task:
```
.plan/implementation/tasks/{TASK-ID}-{slug}.md
```

The task file contains its own "Required Reading" section. Load exactly those files, nothing more.

**Step 3 — Verify preconditions**

Before writing any code, confirm:
- [ ] All task dependencies are COMPLETE (check TASK_REGISTER.md)
- [ ] No Unresolved Decisions block this task (check PROGRESS.md)
- [ ] The required files from step 2 are loaded

If any dependency is not complete: stop. Report which dependency is blocking. Do not implement partial solutions for blocked tasks.

---

## During Implementation

**Rule 1: Stay in scope.**
Only change files listed in the task's "Files Expected to Change" section. If a file not in that list needs to change, stop and evaluate: is this necessary? If yes, note it. If it represents scope bleed, add it to PROGRESS.md as a follow-up.

**Rule 2: Match the spec.**
The component spec in `design-system/components/` is the contract. Match it exactly. If there's a gap between spec and implementation, resolve the gap — either fix the implementation or update the spec with a justification.

**Rule 3: Use token discipline.**
Do not load files beyond what the task requires. The task's Required Reading section was designed to be minimal. Trust it.

**Rule 4: Validate as you go.**
After each significant change, run the TypeScript compiler:
```bash
npx tsc --noEmit -p frontend/tsconfig.json
# or
npx tsc --noEmit -p backend/tsconfig.json
```
Do not accumulate TypeScript errors. Fix them before moving forward.

**Rule 5: No architecture decisions during implementation.**
If an architectural question arises that the task spec doesn't answer, stop. Document the question in PROGRESS.md under "Implementation Risks" and surface it to the user. Do not make architectural guesses.

---

## Task Completion Protocol

When a task's acceptance criteria are satisfied:

**Step 1 — Run the implementation review checklist**
```
.plan/governance/IMPLEMENTATION_REVIEW_CHECKLIST.md
```
Complete all applicable sections. Do not skip sections that are inconvenient.

**Step 2 — Run build verification**
```bash
npm run build -w frontend    # must produce 0 TypeScript errors
# or
npm run build -w backend
```

**Step 3 — Update documentation**

Update exactly these files (no more, no less):
```
a. .plan/implementation/TASK_REGISTER.md
   → Change task status to COMPLETE

b. .plan/implementation/PROGRESS.md
   → Move task to "Completed Tasks"
   → Update Phase Status table
   → Update Milestone Progress if applicable
   → Add any architecture debt introduced
   → Add session log entry

c. If implementation diverged from spec:
   → Update the relevant design-system/components/ or engineering/ file

d. If a new decision was made:
   → Append to .plan/DECISION_LOG.md
```

**Step 4 — Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(scope): brief description

- Key change 1
- Key change 2

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Commit scope = the phase and task area. Examples:
- `feat(layout): home screen four-zone scaffold`
- `feat(backend): dayaggregate computation service`
- `feat(intelligence): tier-1 signal computation functions`

**Step 5 — Identify next task**

Read TASK_REGISTER.md. Find the next NOT_STARTED task where all dependencies are COMPLETE. Report it to the user as the next recommended task.

---

## How to Pick the Next Task

1. Open TASK_REGISTER.md
2. Find all NOT_STARTED tasks
3. For each NOT_STARTED task, check its "Depends On" column
4. If all dependencies are COMPLETE → this task is available
5. Among available tasks, prefer: the task in the earliest phase
6. If multiple tasks in the same phase are available → recommend the one with lower complexity first (warm up before complex tasks)

**Never** start a task where a dependency is NOT_STARTED or IN_PROGRESS.

---

## How to Handle Spec Gaps

If the task spec is ambiguous or incomplete:

1. **Check the supporting specs first.** The task file lists Required Reading. Check those docs for the answer before treating it as ambiguous.

2. **Check the invariants.** `architecture/ARCHITECTURE_INVARIANTS.md` often answers behavioral questions.

3. **If still ambiguous:** Do not guess and implement. Add the question to PROGRESS.md under "Implementation Risks" and ask the user explicitly.

The cost of asking one question is one turn. The cost of implementing the wrong behavior is a future task to fix it.

---

## Context Window Management

If context is filling up during a long implementation session:

1. Commit what is complete
2. Update PROGRESS.md with exact current state (which acceptance criteria are met, which remain)
3. Start a new session
4. Follow the Session Start protocol above
5. Re-load the task file — it contains all context needed to continue

Never continue implementation in a degraded context. The quality of the output degrades with the quality of the context.

---

## High-Risk Task Protocol

Tasks marked with risk level HIGH in their task file require additional caution:

- Read the task fully before writing any code
- Identify the riskiest part of the implementation
- Implement and test the risky part first, before dependent parts
- Do not mark the task complete until the risky acceptance criteria pass
- For backend intelligence tasks (P05-001, P05-002, P05-004): create a fixture file with test inputs/expected outputs before implementing

---

## What a Good Session Looks Like

```
Session start:    Read CLAUDE.md + PROGRESS.md + TASK_REGISTER.md (5 min)
                  Load task file (3 min)
                  Verify preconditions (2 min)

Implementation:   Write code, run tsc frequently
                  Stay in spec
                  No scope bleed
                  No architectural decisions

Session end:      Run checklist
                  Run build
                  Update PROGRESS.md + TASK_REGISTER.md
                  Commit
                  Identify next task
```

Total overhead per session: ~15 minutes.
Total implementation: the rest of the session.

---

## What a Bad Session Looks Like (Avoid These)

❌ Starting without reading PROGRESS.md → re-making decisions already made
❌ Reading more files than Required Reading specifies → wasted tokens, context dilution
❌ Implementing before verifying dependencies → building on incomplete foundation
❌ Making an architectural decision in the middle of implementation → invisible drift
❌ Not running the review checklist → shipping drift
❌ Not updating PROGRESS.md after completion → next session starts blind
❌ "While I'm here" changes outside task scope → scope bleed, unclean commits
❌ Continuing in a full context window → degraded quality output

---

*This protocol is how the product stays coherent across many sessions and many contexts.*
*Every session that follows it fully inherits the quality of every session before it.*
