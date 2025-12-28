---
description: Create a new feature or bug track with spec and plan
argument-hint: [description]
allowed-tools: Read, Write, Glob, Task
model: inherit
---

# Conductor New Track

Create new track (feature/bug/chore) with spec and plan.

## Pre-flight Checks

**Read these files in parallel (4 Read calls in one response):**
1. `conductor/tech-stack.md` - Verify exists, load tech context
2. `conductor/workflow.md` - Verify exists, load workflow context
3. `conductor/product.md` - Verify exists, load product context
4. `conductor/tracks.md` - Get existing track IDs (handle if missing)

If any of the first 3 files are missing: "Run `/conductor:setup` first."

> **Performance note:** Parallel reads speed up pre-flight verification.

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
- subagent_type: 'conductor:planner'
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

### Background Planning Option

For large features or when user wants to continue working:

```
Task tool:
- subagent_type: 'conductor:planner'
- run_in_background: true
- prompt: |
    Create specification and implementation plan for: <description>
    ...
```

**When to use:**
- User explicitly requests background execution ("plan this in background")
- Feature is complex (expected to generate large spec/plan)
- User wants to work on other tasks while planning proceeds

**Important caveats:**
- Background planning is NOT recommended for most cases because:
  - Planner uses interactive questioning (AskUserQuestion) which requires foreground
  - User feedback is valuable during spec refinement
- Only use if user explicitly prefers to review completed artifacts without iteration

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
