---
description: Create a new feature or bug track with spec and plan
argument-hint: [description]
allowed-tools: Read, Write, Glob, Task
model: claude-opus-4-5-20251101
---

# Conductor New Track

Create a new track (feature, bug, or chore) with specification and implementation plan.

## Pre-flight Checks

1. **Verify Conductor Setup**:

   - Check for `conductor/tech-stack.md`
   - Check for `conductor/workflow.md`
   - Check for `conductor/product.md`
   - If any missing: "Conductor is not set up. Run `/conductor:setup` first."

2. **Check for existing tracks**:
   - Use Bash to check if tracks file exists: `test -f conductor/tracks.md && echo "exists" || echo "not found"`
   - If "exists", read `conductor/tracks.md` and list existing track IDs to avoid duplicates
   - If "not found", this will be the first track

## Get Track Description

### If description provided ($ARGUMENTS)

Use the provided description:

```
Track description: $ARGUMENTS
```

### If no description provided

Ask the user:

> "Please provide a brief description of the track (feature, bug fix, chore) you want to create."

Wait for response.

## Determine Track Type

Analyze the description to infer type:

- **Feature**: New functionality, "add", "create", "implement"
- **Bug**: Fix, repair, "fix", "broken", "error"
- **Chore**: Maintenance, "update", "refactor", "clean"

Do NOT ask user to classify - infer from description.

## Delegate to Planner Agent

ALWAYS use the Task tool to delegate specification and plan generation to the planner agent:

```
Task tool:
- subagent_type: 'planner'
- prompt: |
    Create specification and plan for track: <description>
    Track type: <feature|bug|chore>

    Context files to read:
    - conductor/product.md
    - conductor/tech-stack.md
    - conductor/workflow.md
    - conductor/tracks.md

    Requirements:
    1. Conduct interactive questioning (3-5 questions based on track type)
    2. Generate spec.md following template structure
    3. Generate plan.md with TDD task structure
    4. Each phase must end with verification task

    Return both artifacts for user review.
```

The planner agent will:

- Conduct interactive questioning based on track type
- Generate spec.md with functional/non-functional requirements
- Generate plan.md with TDD-structured tasks
- Present artifacts for user review and approval

## Review Artifacts

After planner agent returns:

### Specification Review

Present the spec.md:

> "I've drafted the specification. Please review:"
>
> ```markdown
> [spec.md content]
> ```
>
> Does this capture the requirements correctly?
> A) Approve and continue
> B) Suggest changes

If B, incorporate feedback and re-generate with planner agent.

### Plan Review

Present the plan.md:

> "I've created the implementation plan. Please review:"
>
> ```markdown
> [plan.md content]
> ```
>
> Does this plan cover all the necessary steps?
> A) Approve and create track
> B) Suggest changes

If B, incorporate feedback and re-generate with planner agent.

## Create Track Artifacts

### Generate Track ID

Format: `<shortname>_YYYYMMDD`

Example: `user_auth_20241222`

### Check for Duplicates

If track ID matches existing track:

> "A track with similar name already exists. Choose a different name."

### Create Files

1. **Create directory**:

   ```
   conductor/tracks/<track_id>/
   ```

2. **Write metadata.json**:

   ```json
   {
     "track_id": "<track_id>",
     "type": "feature",
     "status": "new",
     "created_at": "<ISO timestamp>",
     "updated_at": "<ISO timestamp>",
     "description": "<user description>"
   }
   ```

3. **Write spec.md**:
   The approved specification content.

4. **Write plan.md**:
   The approved plan content.

### Update Tracks File

Append to `conductor/tracks.md`:

```markdown
---

## [ ] Track: <Track Description>

_Link: [./conductor/tracks/<track_id>/](./conductor/tracks/<track_id>/)_
```

## Completion

Announce:

> "New track '<track_id>' has been created!
>
> Files created:
>
> - conductor/tracks/<track_id>/spec.md
> - conductor/tracks/<track_id>/plan.md
> - conductor/tracks/<track_id>/metadata.json
>
> The track has been added to conductor/tracks.md.
>
> Next steps:
>
> - Review the spec and plan in your editor
> - Run `/conductor:implement` to start working
> - Run `/conductor:status` to see all tracks"
