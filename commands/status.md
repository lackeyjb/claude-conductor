---
description: Display current progress of Conductor-managed project
allowed-tools: Read, Glob, Bash
model: claude-haiku-4-5-20251001
---

# Conductor Status

Display comprehensive project status overview.

## Pre-flight Check

1. Check `conductor/tracks.md` exists. If not: "Run `/conductor:setup` to initialize."
2. If empty: "No tracks. Create one with `/conductor:new-track`."

## Gather Data

- Read `conductor/product.md` for project name
- Read `conductor/tracks.md` for track list
- For each track in `conductor/tracks/`:
  - Read `plan.md`
  - Count tasks: `[ ]` pending, `[~]` in-progress, `[x]` completed
  - Identify current phase and task

## Generate Report

Display status with:
- Project name and timestamp
- Tracks overview: Completed ✅ / In Progress 🔄 / Pending ⏳ counts
- Current focus: Track, Phase, Task (all `[~]` items)
- Progress bar: `[████░░░░] X%` (completed/total tasks)
- Track details: Tree view with status indicators per phase/task
- Next actions: Upcoming 2-3 tasks
- Call to action: "Run /conductor:implement to continue"

### If Blockers

Show section with blocked tasks and reasons (from plan.md BLOCKED markers).

### If All Complete

Show celebration: "🎉 ALL TRACKS COMPLETE! Create new track with /conductor:new-track"

### Summary Stats

- Total phases/tasks across all tracks
- Overall completion percentage
