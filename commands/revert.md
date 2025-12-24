---
description: Revert a track, phase, or task using git-aware rollback
argument-hint: [track|phase|task] [name]
allowed-tools: Read, Bash, Glob, Grep
model: claude-haiku-4-5-20251001
---

# Conductor Revert

Git-aware revert that understands logical units of work (tracks, phases, tasks).

## Pre-flight Checks

1. **Verify Conductor Setup**:

   - Use Bash to check: `test -f conductor/tracks.md && echo "exists" || echo "not found"`
   - If "not found": "Conductor not set up. Run `/conductor:setup` first."

2. **Check Git Status**:
   ```bash
   git status --porcelain
   ```
   - If uncommitted changes: "You have uncommitted changes. Please commit or stash before reverting."

## Phase 1: Target Selection

### If target provided ($ARGUMENTS)

Parse the argument:

- `track <name>` → Revert entire track
- `phase <name>` → Revert specific phase
- `task <name>` → Revert specific task

Search for matching item in tracks and plans.

### If no target provided

1. **Scan for revert candidates**:

   - Read `conductor/tracks.md`
   - Read all `conductor/tracks/*/plan.md`

2. **Prioritize in-progress items**:

   - Find all `[~]` marked tracks, phases, tasks

3. **Fallback to recently completed**:

   - If no in-progress items, show 5 most recent `[x]` items

4. **Present menu**:

   ```
   I found the following items that can be reverted:

   Track: user_auth_20241222
     1) [Phase] Backend API [~]
     2) [Task] Implement JWT validation [~]

   Track: dashboard_ui_20241220
     3) [Phase] Component Setup [x]
     4) [Task] Create header component [x]

   5) A different track, phase, or task

   Which would you like to revert?
   ```

5. **Handle selection**:
   - If 1-4: Confirm selection and proceed
   - If 5: Ask for specific name/description

### Confirm Target

> "You want to revert: [Phase] 'Backend API' from track 'user_auth_20241222'.
> Is this correct?
> A) Yes, proceed with analysis
> B) No, select different target"

## Phase 2: Git Analysis

### Identify Implementation Commits

1. **Read the plan.md** for the target item
2. **Extract commit SHAs** from completed tasks:

   ```
   - [x] Task: Implement JWT validation [a1b2c3d]
   ```

3. **Verify commits exist**:

   ```bash
   git cat-file -t <sha>
   ```

4. **Handle missing commits** (rewritten history):

   > "Commit a1b2c3d not found. It may have been rebased.
   > Searching for similar commit..."

   Search by commit message:

   ```bash
   git log --oneline --all | grep "Implement JWT"
   ```

   Present candidate and ask for confirmation.

### Identify Plan Update Commits

For each implementation commit, find the corresponding plan update:

```bash
git log --oneline -- conductor/tracks/<id>/plan.md
```

Look for commits with messages like:

- `conductor(plan): Complete 'Implement JWT validation'`
- `conductor(checkpoint): Complete phase 'Backend API'`

### For Track Reverts: Find Creation Commit

```bash
git log --oneline -- conductor/tracks.md | grep "Track: <description>"
```

### Compile Final List

Create ordered list of all commits to revert:

1. Most recent first
2. Include both implementation and plan commits
3. Note any merge commits that need special handling

## Phase 3: Execution Plan

### Present Summary

```
I have analyzed the git history. Here is the revert plan:

Target: Revert Phase 'Backend API'

Commits to revert (newest first):
  1. b2c3d4e - conductor(plan): Complete 'Add rate limiting'
  2. a1b2c3d - feat(api): Add rate limiting to endpoints
  3. 9f8e7d6 - conductor(plan): Complete 'Implement JWT validation'
  4. 8e7d6c5 - feat(auth): Implement JWT validation

Action: I will run `git revert --no-edit` on each commit in this order.

Do you want to proceed?
A) Yes, execute the revert
B) No, cancel
```

### Warnings

If merge commits found:

> "WARNING: Commit <sha> is a merge commit. Reverting may be complex.
> Consider manually reverting or using `git revert -m 1`."

If commits are very old:

> "Note: These commits are from <date>. There may be dependent code
> that will break. Review carefully after revert."

## Phase 4: Execution

### Execute Reverts

For each commit (newest to oldest):

```bash
git revert --no-edit <sha>
```

### Handle Conflicts

If conflict occurs:

```
Conflict detected while reverting commit <sha>.

The conflicting files are:
- src/auth/jwt.ts

Options:
A) I'll show you the conflict for manual resolution
B) Abort the revert entirely

Please choose how to proceed.
```

If A:

- Show the conflict markers
- Wait for user to resolve
- Continue with: `git add . && git revert --continue`

If B:

- Run: `git revert --abort`
- Announce: "Revert aborted. Repository is back to previous state."

### Verify Plan State

After reverts complete:

1. Read the affected plan.md
2. Check if task/phase status matches reverted state
3. If not, edit to fix:
   - Change `[x]` back to `[ ]`
   - Remove commit SHAs from task lines
4. Commit the plan fix:
   ```bash
   git add conductor/tracks/<id>/plan.md
   git commit -m "conductor(plan): Reset status after revert"
   ```

## Completion

### Announce Success

```
Revert complete!

Summary:
- Reverted 4 commits
- Reset phase 'Backend API' status to pending
- Plan.md updated to reflect current state

The following changes were undone:
- JWT validation implementation
- Rate limiting implementation

Next steps:
- Run tests to ensure no regressions: npm test
- Run /conductor:status to see updated progress
- Run /conductor:implement to restart work on this phase
```

### If Partial Revert

```
Partial revert completed.

Successfully reverted:
- a1b2c3d - feat(auth): Implement JWT validation

Failed to revert (conflicts):
- b2c3d4e - feat(api): Add rate limiting

The conflicting commit was skipped. You may need to:
1. Manually revert the remaining changes
2. Or accept the partial revert

Run `git status` to see current state.
```
