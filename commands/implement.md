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

### Step 1: Mark Task In Progress

Edit plan.md: Change `- [ ] Task:` to `- [~] Task:`

### Step 2: TDD Red Phase

1. Identify what needs to be tested
2. Create or update test file
3. Write failing test that defines expected behavior
4. Run tests: Confirm FAILURE
5. If tests pass prematurely, the test is wrong - fix it

### Step 3: TDD Green Phase

1. Write MINIMUM code to make test pass
2. No extra features, no premature optimization
3. Run tests: Confirm PASS
4. If tests fail, debug and fix

### Step 4: Refactor Phase

1. With passing tests as safety net:
   - Remove duplication
   - Improve naming
   - Simplify logic
2. Run tests after each change
3. All tests must stay green

### Step 5: Verify Coverage

Run coverage tool for the project:
```bash
# JavaScript/TypeScript
npx jest --coverage

# Python
pytest --cov=src

# Go
go test -cover ./...
```

Target: Coverage meets workflow.md requirement (default >80%)

### Step 6: Commit Code Changes

```bash
git add <changed files>
git commit -m "<type>(<scope>): <description>"
```

Types: feat, fix, refactor, test, docs, style, chore

### Step 7: Attach Git Notes

Get commit SHA and attach summary:
```bash
SHA=$(git log -1 --format="%H")
git notes add -m "Task: <task name>
Changes: <summary>
Files: <list>" $SHA
```

### Step 8: Update Plan

1. Edit plan.md
2. Change `- [~] Task:` to `- [x] Task: ... [<short-sha>]`
3. Commit: `conductor(plan): Complete task '<task name>'`

### Phase Completion Check

When all tasks in a phase are complete:

1. **Announce**: "Phase '<name>' complete. Running verification protocol."

2. **Ensure Coverage**:
   - List files changed in this phase
   - Verify each has corresponding tests
   - Create missing tests if needed

3. **Run Full Test Suite**:
   - Announce command before running
   - If failures, attempt fix (max 2 tries)
   - If still failing, ask user for guidance

4. **Generate Manual Verification Plan**:
   Based on phase goals from spec.md, provide specific steps:
   ```
   Manual Verification Steps:
   1. Start the development server: `npm run dev`
   2. Open browser to: http://localhost:3000
   3. Confirm you see: [expected result]
   ```

5. **Await User Confirmation**:
   "Does this meet your expectations? Please confirm or provide feedback."

6. **Create Checkpoint**:
   ```bash
   git add .
   git commit -m "conductor(checkpoint): Complete phase '<name>'"
   ```

7. **Attach Verification Report**:
   ```bash
   git notes add -m "Phase: <name>
   Automated Tests: PASSED
   Manual Verification: CONFIRMED
   Coverage: XX%" $(git log -1 --format="%H")
   ```

8. **Update Plan with Checkpoint SHA**:
   Add `[checkpoint: <sha>]` to phase heading

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
