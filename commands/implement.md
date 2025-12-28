---
description: Execute tasks from the current track following TDD workflow
argument-hint: [<track-name>] [--all]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
model: inherit
---

# Conductor Implement

Execute the implementation workflow for the selected track.

## Pre-flight Checks

**Run these checks in parallel (single response with multiple Bash calls):**

1. **Verify Conductor Setup**:

   ```bash
   test -f conductor/tech-stack.md && test -f conductor/workflow.md && test -f conductor/product.md && echo "ready" || echo "missing"
   ```
   - If "missing": "Conductor is not set up. Please run `/conductor:setup` first."

2. **Check for tracks**:

   ```bash
   test -f conductor/tracks.md && echo "exists" || echo "not found"
   ```
   - If "not found": "No tracks found. Create one with `/conductor:new-track`."
   - If "exists", read and parse `conductor/tracks.md`
   - If empty or malformed: "No tracks found. Create one with `/conductor:new-track`."

## Argument Parsing

| Pattern | Track Selection | Phase Mode |
|---------|----------------|------------|
| `/implement` | Auto-select first incomplete | Single-phase |
| `/implement user-auth` | Match "user-auth" | Single-phase |
| `/implement --all` | Auto-select first incomplete | All-phases |
| `/implement user-auth --all` | Match "user-auth" | All-phases |

## Track Selection

### If track name provided ($ARGUMENTS)

1. Search `conductor/tracks.md` for matching track description
2. If found: "Found track '<description>'. Is this correct?"
3. If not found: Suggest closest match or next available track

### If no track name provided

1. Find first incomplete track (`[ ]` or `[~]`)
2. Announce: "Selecting next incomplete track: '<description>'"
3. If no incomplete tracks: "All tracks complete! Create a new one with `/conductor:new-track`."

## Begin Implementation

### Check for Handoff Resume

Before starting, check if resuming from a previous handoff:

1. **Check for handoff state**: Look for `conductor/tracks/<track_id>/handoff-state.json`

2. **If handoff state exists**:

   - Read the handoff state to get resume context
   - Restore phase mode from state:
     - If `run_all_phases: true` → resume in all-phases mode
     - If `selected_phase` is set → resume in single-phase mode for that phase
   - Announce: "Resuming from handoff at phase '<phase>', task '<next_task>'"
   - Clear `.context_usage` file to reset threshold tracking
   - Delete `handoff-state.json` after reading (resume is one-time)
   - Skip Phase Discovery and Phase Selection (already determined)
   - Skip to the `next_task` in the Task Execution Loop

3. **If no handoff state**: Proceed with normal implementation flow

### Update Track Status

1. Find track heading in `conductor/tracks.md`
2. Change `## [ ] Track:` to `## [~] Track:` (if not already in progress)
3. Commit: `conductor(track): Start track '<description>'` (if status changed)

### Load Track Context

**Read these files in parallel (use multiple Read tool calls in one response):**

- `conductor/tracks/<track_id>/plan.md`
- `conductor/tracks/<track_id>/spec.md`
- `conductor/workflow.md`
- `conductor/tech-stack.md`

> **Performance note:** These files are independent and can be read simultaneously.

## Phase Discovery

Parse phases from the track's `plan.md`:

1. **Find phase headings**: Match `## Phase N: <Name>` patterns (H2 headings)
2. **Detect completed phases**: Phases with `[checkpoint: <sha>]` suffix are complete
3. **Count tasks per phase**: Count `- [ ]`, `- [~]`, `- [x]` lines under each phase
4. **Determine phase status**:
   - `complete`: Has checkpoint SHA in heading
   - `in_progress`: Has any task marked `[~]`
   - `pending`: All tasks marked `[ ]`

Build ordered list of phases with their status and task counts.

## Phase Selection

### If `--all` flag is set
Skip selection. Announce "Running all remaining phases for track '<description>'." Proceed to Task Execution Loop.

### If `--all` flag is NOT set (single-phase mode)

| Scenario | Action |
|----------|--------|
| No incomplete phases | Announce complete. Offer `/conductor:status` or `/conductor:new-track`. **STOP** |
| Exactly 1 incomplete | Auto-select. Announce "Only one phase remaining: Phase N: <name>. Proceeding..." |
| Multiple incomplete | Use AskUserQuestion with options for each phase + "All remaining" option |

**Processing selection:**
- If phase selected: Set `selected_phase = N`
- If "All remaining": Set `run_all_phases = true`

## Task Execution Loop

### Determine Execution Scope

Based on Phase Selection results:

1. **If `run_all_phases = true`**: Execute all tasks from first incomplete phase through end
2. **If `selected_phase` is set**: Execute only tasks within the selected phase

### For each task in scope (in order):

### Delegate to Implementer Agent

ALWAYS use the Task tool to delegate task execution to the implementer agent:

```
Task tool:
- subagent_type: 'conductor:implementer'
- prompt: |
    Execute task: <task description>

    Track ID: <track_id>
    Context files:
    - conductor/tracks/<track_id>/spec.md
    - conductor/tracks/<track_id>/plan.md
    - conductor/workflow.md
    - conductor/tech-stack.md

    Requirements:
    1. Mark task in progress in plan.md
    2. Follow TDD: Red → Green → Refactor
    3. Verify coverage meets threshold (>80%)
    4. Run quality checks (lint, typecheck)
    5. Commit with conventional message
    6. Attach git notes with summary
    7. Update plan.md with commit SHA
    8. Commit plan update

    Report back when task is complete or if blocked.
```

The implementer agent will:

- Execute the full TDD cycle
- Commit code changes with proper messages
- Update plan.md with progress
- Report completion or blockers

### Background Execution Option

For long-running tasks or parallel workflows, run the implementer in background:

**When to use:**
- User explicitly requests it ("run in background", "work on this while I...")
- Task is estimated to take significant time
- User wants to work on unrelated tasks in parallel

**Resource Warning:**
- Each background agent runs tests independently, consuming significant CPU
- Limit to 2-3 concurrent background agents to avoid system overload
- On resource-constrained systems, prefer `parallel_agents: sequential` mode
- Use `/conductor:agents` to monitor running agents and clean up orphaned worktrees

**Worktree isolation (if `parallel_agents: worktree` in workflow.md):**

1. **Before spawning agent**, create isolated worktree:
   ```bash
   TASK_ID="task_$(date +%s)"
   git worktree add .worktrees/implementer-$TASK_ID -b conductor/implementer-$TASK_ID
   ```

2. **Spawn agent with worktree path**:
   ```
   Task tool:
   - subagent_type: 'conductor:implementer'
   - run_in_background: true
   - prompt: |
       WORKING DIRECTORY: .worktrees/implementer-<task_id>

       Execute task: <task description>

       Track ID: <track_id>
       Context files (relative to worktree):
       - conductor/tracks/<track_id>/spec.md
       - conductor/tracks/<track_id>/plan.md
       ...
   ```

3. **Announce**: "Running implementer in background (worktree: `.worktrees/implementer-<task_id>`). Task: '<description>'"

4. **On completion** (use TaskOutput to retrieve):
   ```bash
   # Switch to worktree to get changes
   cd .worktrees/implementer-$TASK_ID

   # Merge branch back
   git checkout main
   git merge --no-ff conductor/implementer-$TASK_ID -m "conductor(merge): Complete background task '<description>'"

   # Cleanup worktree
   git worktree remove .worktrees/implementer-$TASK_ID
   git branch -d conductor/implementer-$TASK_ID
   ```

**Important:**
- If `parallel_agents: sequential`, queue background agents instead of running in parallel
- If `parallel_agents: unsafe`, skip worktree creation (not recommended)
- DO NOT use background for dependent tasks within a phase
- Always verify background completion before phase verification

### Phase Completion Check

**CRITICAL**: If implementer was running in background, use TaskOutput to retrieve results before phase verification.

When all tasks in a phase are complete, delegate to reviewer agent:

```
Task tool:
- subagent_type: 'conductor:reviewer'
- prompt: |
    Verify phase: <phase name>

    Track ID: <track_id>
    Context files:
    - conductor/tracks/<track_id>/spec.md
    - conductor/tracks/<track_id>/plan.md
    - conductor/workflow.md

    Requirements:
    1. Announce verification protocol start
    2. Verify test coverage for all changed files
    3. Run automated tests
    4. Generate manual verification plan
    5. Await user confirmation
    6. Create checkpoint commit with git notes
    7. Update plan.md with checkpoint SHA

    Do not proceed past step 5 without explicit user approval.
```

The reviewer agent will:

- Verify test coverage for phase changes
- Run full test suite
- Generate manual verification steps
- Await user confirmation
- Create checkpoint commit
- Update plan with checkpoint SHA

### After Phase Verification Completes

**Single-phase mode:** Announce "Phase N: <name> complete. Checkpoint: <sha>". Use AskUserQuestion: Continue to next phase / Take a break / Check status. Act accordingly.

**All-phases mode:** Continue directly to next phase. Only stop at track completion or threshold.

### Context Threshold Check

After each task: Check `conductor/.context_usage` (written by hook). If `estimated_percent >= threshold`, trigger handoff protocol.

## Context Handoff Protocol

When threshold reached:

1. **Announce:** "⚠️ Context threshold reached (X%). Initiating handoff..."

2. **Checkpoint Commit:**
   ```bash
   git add . && git commit -m "conductor(checkpoint): Context threshold handoff - <track>"
   ```

3. **Git Notes:**
   ```bash
   git notes add -m "Handoff: Threshold reached. Track: <track_id>, Phase: <phase> (X/Y tasks), Next: <next_task>" $(git log -1 --format="%H")
   ```

4. **Write `handoff-state.json`:** Save current phase, task, mode (`run_all_phases`, `selected_phase`) to `conductor/tracks/<track_id>/handoff-state.json`

5. **Display Handoff Prompt:**
   ```
   CONDUCTOR HANDOFF - Context threshold reached.

   Start fresh session and run: /conductor:implement

   Resume context:
   - Track: <track_id>
   - Phase: <phase> (X/Y tasks)
   - Next: <next_task>
   ```

6. **STOP:** Do NOT continue to next task. Wait for user to start fresh session.

## Track Completion

When all phases complete:

1. Update `tracks.md`: `[~]` → `[x]`
2. Review if `product.md` or `tech-stack.md` need updates (propose, await approval)
3. Use AskUserQuestion: Archive to conductor/archive / Delete / Leave as-is
4. Announce: "Track complete! Run `/conductor:status` for overall progress."
