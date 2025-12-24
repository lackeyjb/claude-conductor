---
description: Create a new feature or bug track with spec and plan
argument-hint: [description]
allowed-tools: Read, Write, Glob, Task
model: claude-opus-4-5-20251101
---

# Conductor New Track

Create new track (feature/bug/chore) with spec and plan.

## Pre-flight Checks

1. Verify `conductor/tech-stack.md`, `conductor/workflow.md`, `conductor/product.md` exist. If any missing: "Run `/conductor:setup` first."
2. Read `conductor/tracks.md` if exists to list existing track IDs (avoid duplicates)

## Get Track Description

| Scenario | Action |
|----------|--------|
| Description provided ($ARGUMENTS) | Use directly |
| No description | Ask: "Provide brief track description (feature/bug/chore)" |

## Determine Track Type

Infer from description (don't ask):
- **Feature**: "add", "create", "implement"
- **Bug**: "fix", "broken", "error"
- **Chore**: "update", "refactor", "clean"

## Delegate to Planner Agent

ALWAYS use Task tool:
```
Task tool:
- subagent_type: 'planner'
- prompt: |
    Create specification and implementation plan for: <description>

    Track type: <feature|bug|chore>

    Context files:
    - conductor/product.md
    - conductor/tech-stack.md
    - conductor/workflow.md

    Generate:
    1. Specification (spec.md): Requirements, acceptance criteria, constraints
    2. Implementation plan (plan.md): Phased breakdown with TDD-oriented tasks
    3. Generate unique track_id: <sanitized_description>_<YYYYMMDD>

    Return track_id, file paths, and summary when complete.
```

## Finalize Track

After planner completes:

1. **Read generated files** to verify structure
2. **Create metadata.json:**
   ```json
   {
     "id": "<track_id>",
     "description": "<description>",
     "type": "<feature|bug|chore>",
     "created_at": "<ISO timestamp>",
     "status": "pending"
   }
   ```
3. **Register in tracks.md:**
   - If file doesn't exist, create with header
   - Append: `## [ ] Track: <description> [<track_id>]`
   - Keep tracks in chronological order
4. **Commit:**
   ```bash
   git add conductor/tracks.md conductor/tracks/<track_id>/
   git commit -m "conductor(track): Add track '<description>'"
   ```
5. **Announce:** "Track '<description>' created. Run `/conductor:implement <description>` to start."
