---
description: Create a new feature or bug track with spec and plan
argument-hint: [description]
allowed-tools: Read, Write, Glob, Task
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
   - Read `conductor/tracks.md`
   - List existing track IDs to avoid duplicates

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

## Generate Specification (spec.md)

### Interactive Questioning

Delegate to conductor-planner agent or conduct inline:

1. Announce: "I'll ask a few questions to build a comprehensive specification."

2. Ask 3-5 questions based on track type:

**For Features:**
- What problem does this solve?
- Who is the target user?
- What's the expected behavior?
- Are there any constraints?
- How should edge cases be handled?

**For Bugs:**
- What is the current (broken) behavior?
- What is the expected behavior?
- Steps to reproduce?

**For Chores:**
- What needs to be updated/changed?
- What's the scope of the change?
- Any dependencies affected?

3. For each question:
   - Provide 3 suggested options
   - Include "Type your own answer"
   - Wait for response before next question

### Draft Specification

Generate spec.md with:
- Overview
- Functional Requirements (with acceptance criteria)
- Non-Functional Requirements (if applicable)
- User Stories (for features)
- Technical Considerations
- Out of Scope

### Review Loop

Present draft:
> "I've drafted the specification. Please review:"
>
> ```markdown
> [spec.md content]
> ```
>
> Does this capture the requirements correctly?
> A) Approve and continue
> B) Suggest changes

If B, incorporate feedback and re-present.

## Generate Plan (plan.md)

### Load Context

- Read confirmed spec.md
- Read `conductor/workflow.md` for methodology

### Generate Plan

Create plan.md with:
- Phases (logical groupings)
- Tasks (actionable items)
- Sub-tasks (TDD structure if specified in workflow)
- Verification tasks at end of each phase

### Structure Requirements

1. **Follow workflow methodology** (e.g., TDD):
   ```markdown
   - [ ] Task: Implement user validation
     - [ ] Write tests for email validation
     - [ ] Implement email validation
     - [ ] Write tests for password validation
     - [ ] Implement password validation
   ```

2. **Include phase verification**:
   ```markdown
   - [ ] Conductor: User Manual Verification 'Phase 1'
   ```

### Review Loop

Present draft:
> "I've created the implementation plan. Please review:"
>
> ```markdown
> [plan.md content]
> ```
>
> Does this plan cover all the necessary steps?
> A) Approve and create track
> B) Suggest changes

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
*Link: [./conductor/tracks/<track_id>/](./conductor/tracks/<track_id>/)*
```

## Completion

Announce:
> "New track '<track_id>' has been created!
>
> Files created:
> - conductor/tracks/<track_id>/spec.md
> - conductor/tracks/<track_id>/plan.md
> - conductor/tracks/<track_id>/metadata.json
>
> The track has been added to conductor/tracks.md.
>
> Next steps:
> - Review the spec and plan in your editor
> - Run `/conductor:implement` to start working
> - Run `/conductor:status` to see all tracks"
