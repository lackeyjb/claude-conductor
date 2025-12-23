---
description: Execute tasks from the current track following TDD workflow
argument-hint: [track-name]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
---

# Conductor Implement

Execute the implementation workflow for the selected track.

## Pre-flight Checks

1. **Verify Conductor Setup**:
   - Check for `conductor/tech-stack.md`
   - Check for `conductor/workflow.md`
   - Check for `conductor/product.md`
   - If any missing: "Conductor is not set up. Please run `/conductor:setup` first."

2. **Check for tracks**:
   - Parse `conductor/tracks.md`
   - If empty or malformed: "No tracks found. Create one with `/conductor:newTrack`."

## Track Selection

### If track name provided ($ARGUMENTS)

1. Search `conductor/tracks.md` for matching track description
2. If found: "Found track '<description>'. Is this correct?"
3. If not found: Suggest closest match or next available track

### If no track name provided

1. Find first incomplete track (`[ ]` or `[~]`)
2. Announce: "Selecting next incomplete track: '<description>'"
3. If no incomplete tracks: "All tracks complete! Create a new one with `/conductor:newTrack`."

## Begin Implementation

### Check for Handoff Resume

Before starting, check if resuming from a previous handoff:

1. **Check for handoff state**: Look for `conductor/tracks/<track_id>/handoff-state.json`

2. **If handoff state exists**:
   - Read the handoff state to get resume context
   - Announce: "Resuming from handoff at phase '<phase>', task '<next_task>'"
   - Clear `.context_usage` file to reset threshold tracking
   - Delete `handoff-state.json` after reading (resume is one-time)
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

## Task Execution Loop

For each task in plan.md (in order):

### Delegate to Implementer Agent

ALWAYS use the Task tool to delegate task execution to the implementer agent:

```
Task tool:
- subagent_type: 'conductor-implementer'
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
- subagent_type: 'conductor-reviewer'
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
  "phase_progress": "X/Y tasks",
  "last_completed_task": "<task description>",
  "last_commit_sha": "<sha>",
  "next_task": "<task description>",
  "resume_instructions": [
    "Start a fresh Claude Code session",
    "Run /conductor:implement to continue"
  ]
}
```

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
