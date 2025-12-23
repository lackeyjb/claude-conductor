---
description: Display current progress of Conductor-managed project
allowed-tools: Read, Glob, Bash
---

# Conductor Status

Display a comprehensive status overview of the project.

## Pre-flight Check

1. Verify `conductor/tracks.md` exists
2. If missing: "Conductor not set up. Run `/conductor:setup` to initialize."
3. Verify file is not empty
4. If empty: "No tracks found. Create one with `/conductor:newTrack`."

## Gather Data

### Read Project Context

- `conductor/product.md` - Extract project name
- `conductor/tracks.md` - Parse all tracks

### Parse Each Track

For each track directory in `conductor/tracks/`:
1. Read `plan.md`
2. Count tasks by status:
   - `[ ]` = Pending
   - `[~]` = In Progress
   - `[x]` = Completed
3. Identify current phase and task

## Generate Report

Format and display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CONDUCTOR STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Project: <from product.md>
  Generated: <current timestamp>

TRACKS OVERVIEW
───────────────────────────────────────────────────
  Completed:   <count>  ✅
  In Progress: <count>  🔄
  Pending:     <count>  ⏳

CURRENT FOCUS
───────────────────────────────────────────────────
  Track: <current track description>
  Phase: <current phase name> [~]
  Task:  <current task name> [~]

PROGRESS
───────────────────────────────────────────────────
  [████████████░░░░░░░░] 60%  (12/20 tasks)

TRACK DETAILS
───────────────────────────────────────────────────

  [x] Track: User Authentication
      └── 100% complete (8/8 tasks)

  [~] Track: Dashboard UI
      ├── Phase 1: Setup ✅ (3/3)
      ├── Phase 2: Components 🔄 (2/5)
      │   ├── [x] Create header component
      │   ├── [x] Create sidebar component
      │   ├── [~] Create main content area  ← CURRENT
      │   ├── [ ] Create footer component
      │   └── [ ] Add responsive layout
      └── Phase 3: Integration ⏳ (0/4)

  [ ] Track: API Integration
      └── Not started (0/12 tasks)

NEXT ACTIONS
───────────────────────────────────────────────────
  1. Complete: "Create main content area"
  2. Then: "Create footer component"
  3. After phase: Manual verification required

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Run /conductor:implement to continue working
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Additional Information

### If Blockers Exist

If any task is marked with "BLOCKED" in the plan:

```
⚠️  BLOCKERS DETECTED
───────────────────────────────────────────────────
  Task: "Integrate payment API"
  Reason: Waiting for API credentials from vendor

  Task: "Deploy to production"
  Reason: Pending security review
```

### If All Complete

```
🎉 ALL TRACKS COMPLETE!
───────────────────────────────────────────────────
  Total tracks completed: 5
  Total tasks completed: 47

  Create a new track with /conductor:newTrack
```

### Summary Statistics

At the end, provide:
- Total phases across all tracks
- Total tasks across all tracks
- Overall completion percentage
- Estimated remaining work (based on average task time if available)
