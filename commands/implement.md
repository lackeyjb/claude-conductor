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

### Update Track Status

1. Find track heading in `conductor/tracks.md`
2. Change `## [ ] Track:` to `## [~] Track:`
3. Commit: `conductor(track): Start track '<description>'`

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
