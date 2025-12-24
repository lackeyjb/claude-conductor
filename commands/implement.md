---
description: Execute tasks from the current track following TDD workflow
argument-hint: [<track-name>] [--all]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
model: claude-sonnet-4-5-20250929
---

# Conductor Implement

Execute the implementation workflow for the selected track.

## Pre-flight Checks

1. **Verify Conductor Setup**:

   - Use Bash to check required files exist:
     ```bash
     test -f conductor/tech-stack.md && test -f conductor/workflow.md && test -f conductor/product.md && echo "ready" || echo "missing"
     ```
   - If "missing": "Conductor is not set up. Please run `/conductor:setup` first."

2. **Check for tracks**:
   - Use Bash to check: `test -f conductor/tracks.md && echo "exists" || echo "not found"`
   - If "not found": "No tracks found. Create one with `/conductor:new-track`."
   - If "exists", read and parse `conductor/tracks.md`
   - If empty or malformed: "No tracks found. Create one with `/conductor:new-track`."

## Argument Parsing

Parse $ARGUMENTS to determine execution mode:

1. **Check for `--all` flag**: If $ARGUMENTS contains `--all`, set `run_all_phases = true`
2. **Extract track name**: If $1 exists and doesn't start with `--`, use it as the track name

Examples:

- `/implement` → No track name, single-phase mode (interactive selection)
- `/implement user-auth` → Track "user-auth", single-phase mode
- `/implement --all` → No track name, all-phases mode
- `/implement user-auth --all` → Track "user-auth", all-phases mode

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

Read into context:

- `conductor/tracks/<track_id>/plan.md`
- `conductor/tracks/<track_id>/spec.md`
- `conductor/workflow.md`

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

Skip interactive selection. Announce:

```
Running all remaining phases for track '<description>'.
```

Proceed directly to Task Execution Loop with all incomplete phases.

### If `--all` flag is NOT set (default: single-phase mode)

#### If no incomplete phases

```
All phases complete for this track!

Options:
A) Run /conductor:status to see overall progress
B) Run /conductor:new-track to create a new track
```

**STOP execution.**

#### If exactly one incomplete phase

Auto-select the single remaining phase:

```
Only one phase remaining: Phase <N>: <name>
Proceeding with implementation...
```

#### If multiple incomplete phases

Present interactive selection:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Track: <track description>

  Available phases:

  [x] Phase 1: Setup                    [complete]
  [ ] Phase 2: Core Features            [in progress - 3/7 tasks]
  [ ] Phase 3: Integration              [pending - 0/5 tasks]
  [ ] Phase 4: Polish                   [pending - 0/3 tasks]

───────────────────────────────────────────────────

  Which phase would you like to implement?

  A) Phase 2: Core Features (recommended - continue current)
  B) Phase 3: Integration
  C) Phase 4: Polish
  D) All remaining phases (--all behavior)

  Please select an option.
```

#### Process User Selection

1. If A, B, or C: Set `selected_phase = <chosen phase number>`
2. If D: Set `run_all_phases = true`
3. Invalid input: Re-prompt with clarification

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
- subagent_type: 'implementer'
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

### Phase Completion Check

When all tasks in a phase are complete, delegate to reviewer agent:

```
Task tool:
- subagent_type: 'reviewer'
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

#### If running single phase (default mode)

Announce phase completion:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Phase <N>: <name> has been completed and checkpointed.

  Checkpoint: <sha>
  Tasks completed: <count>

───────────────────────────────────────────────────

  Next steps:

  A) Continue to Phase <N+1>: <next phase name>
  B) Take a break (run /conductor:implement later)
  C) Check status (/conductor:status)

  Would you like to continue to the next phase?
```

- **If user selects A**: Continue to next phase (set `selected_phase` to next incomplete phase)
- **If user selects B or C**: Stop execution gracefully

#### If running all phases (--all mode)

Continue directly to next phase without prompting. Only stop at track completion or context threshold.

### Context Threshold Check

**After each task completes**, check context usage:

1. **Read Context Usage**: Check `conductor/.context_usage` file (written by PostToolUse hook)

2. **Parse Threshold**: Read `conductor/workflow.md` Customization table for `Context Threshold` setting (default: 70%)

3. **Compare**:
   - If `estimated_percent` < threshold: Continue to next task
   - If `estimated_percent` >= threshold: Trigger Context Handoff Protocol

## Context Handoff Protocol

When context threshold is reached, execute this protocol:

### 1. Announce Threshold Reached

```
⚠️ Context threshold reached (X% estimated usage).
Initiating graceful handoff to preserve work quality...
```

### 2. Create Checkpoint Commit

```bash
git add .
git commit -m "conductor(checkpoint): Context threshold handoff - <track_description>"
```

### 3. Attach Handoff Metadata (Git Notes)

```bash
SHA=$(git log -1 --format="%H")
git notes add -m "Handoff: Context threshold reached

Track: <track_id>
Phase: <current_phase> (X/Y tasks complete)
Last Task: <last_task_description> [<sha>]
Next Task: <next_task_description>
Threshold: <percentage>%

Resume: /conductor:implement <track_name>" $SHA
```

### 4. Write Handoff State

Create `conductor/tracks/<track_id>/handoff-state.json`:

```json
{
  "created_at": "<ISO timestamp>",
  "reason": "context_threshold",
  "threshold_percent": 70,
  "current_phase": "<phase name>",
  "current_phase_number": 2,
  "phase_progress": "X/Y tasks",
  "run_all_phases": false,
  "selected_phase": 2,
  "last_completed_task": "<task description>",
  "last_commit_sha": "<sha>",
  "next_task": "<task description>",
  "resume_instructions": [
    "Start a fresh Claude Code session",
    "Run /conductor:implement to continue"
  ]
}
```

The `run_all_phases` and `selected_phase` fields preserve the phase mode across sessions.

### 5. Output Handoff Prompt

Display formatted handoff prompt for user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDUCTOR HANDOFF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context threshold reached. Start a fresh session and paste this prompt:

─────────────────────────────────────────────────────
Continue implementing track "<track_description>" using Conductor.

Key context:
- Track: <track_id>
- Phase: <current_phase> (X/Y tasks complete)
- Next: <next_task_description>

Run: /conductor:implement
─────────────────────────────────────────────────────
```

### 6. Stop Execution

**CRITICAL**: Do NOT continue to the next task. The handoff protocol ends the current session's implementation work. Wait for user to start fresh session.

## Track Completion

When all phases complete:

1. **Update tracks.md**: Change `## [~] Track:` to `## [x] Track:`

2. **Synchronize Documentation**:

   - Review if product.md needs updates
   - Review if tech-stack.md needs updates
   - Propose changes, await approval before writing

3. **Offer Cleanup**:

   ```
   Track '<description>' complete! Options:
   A) Archive: Move to conductor/archive/
   B) Delete: Permanently remove
   C) Skip: Leave in tracks.md
   ```

4. **Announce Completion**:
   "Track complete! Run `/conductor:status` to see overall progress."
