---
description: Initialize Conductor environment for context-driven development
argument-hint: [project-type]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Conductor Setup

You are initializing the Conductor context-driven development environment. Follow this protocol precisely.

## Pre-flight Check

1. **Check for existing setup**:
   - Look for `conductor/setup_state.json`
   - If exists, read it and offer to resume from last successful step
   - If `last_successful_step` is "complete", inform user setup is done

2. **Check for conductor directory**:
   - If `conductor/` exists without state file, warn about potential overwrite
   - Ask user to confirm before proceeding

## Phase 1: Project Discovery

### 1.1 Detect Project Maturity

Classify the project as **Brownfield** (existing) or **Greenfield** (new):

**Brownfield Indicators** (check in order):
1. `.git` directory exists
2. `package.json`, `requirements.txt`, `go.mod`, `pom.xml` exists
3. `src/`, `app/`, or `lib/` directories with code files

**Greenfield**: None of the above found, directory empty or only has README.md

### 1.2 Execute Based on Maturity

**If Brownfield:**
1. Announce: "Existing project detected. I'll analyze it to understand the current state."
2. Check git status - warn if uncommitted changes exist
3. Analyze README.md if present
4. Scan manifest files (package.json, etc.) respecting .gitignore
5. Infer tech stack, architecture, and project goals
6. Present findings for confirmation

**If Greenfield:**
1. Announce: "New project detected. Let's set it up from scratch."
2. Initialize git if no .git directory: `git init`
3. Ask: "What do you want to build?"
4. Create `conductor/` directory
5. Write initial concept to `conductor/product.md`

### 1.3 Initialize State

Create `conductor/setup_state.json`:
```json
{
  "last_successful_step": "",
  "project_type": "<brownfield|greenfield>",
  "created_at": "<ISO timestamp>"
}
```

## Phase 2: Context Generation

For each section, follow this pattern:
1. Introduce the section
2. Ask up to 5 sequential questions
3. Provide 3 suggested options + "Type your own" + "Auto-generate"
4. Draft content based on responses
5. Present for approval (revise if needed)
6. Write file
7. Update state file

### 2.1 Product Guide (`conductor/product.md`)

Questions to ask:
- Who are the target users?
- What problems does this solve?
- What are the key features?
- What does success look like?

Update state: `{"last_successful_step": "2.1_product_guide"}`

### 2.2 Product Guidelines (`conductor/product-guidelines.md`)

Questions to ask:
- What's the brand voice/tone?
- Are there design standards to follow?
- What's the communication style?

Update state: `{"last_successful_step": "2.2_product_guidelines"}`

### 2.3 Tech Stack (`conductor/tech-stack.md`)

**For Brownfield:** Present inferred stack, ask for confirmation
**For Greenfield:** Ask about languages, frameworks, databases

Update state: `{"last_successful_step": "2.3_tech_stack"}`

### 2.4 Code Styleguides (`conductor/code_styleguides/`)

Based on tech stack, recommend appropriate style guides.
Copy relevant guides from plugin templates.

Update state: `{"last_successful_step": "2.4_code_styleguides"}`

### 2.5 Workflow (`conductor/workflow.md`)

Copy default workflow template, then ask:
1. Test coverage target? (default: 80%)
2. Commit after each task or phase? (default: task)
3. Use git notes for summaries? (default: yes)

Update state: `{"last_successful_step": "2.5_workflow"}`

## Phase 3: Initial Track

### 3.1 Gather Requirements (Greenfield only)

Ask about:
- User stories
- Functional requirements
- Non-functional requirements

### 3.2 Propose Initial Track

**Greenfield:** Propose MVP track
**Brownfield:** Propose enhancement or maintenance track

Present for approval.

### 3.3 Create Track Artifacts

1. Generate track ID: `<shortname>_YYYYMMDD`
2. Create `conductor/tracks.md` with first track entry
3. Create `conductor/tracks/<track_id>/`
4. Generate and write `spec.md`
5. Generate and write `plan.md` (following workflow methodology)
6. Create `metadata.json`

Update state: `{"last_successful_step": "complete"}`

## Completion

1. Commit all conductor files:
   ```
   git add conductor/
   git commit -m "conductor(setup): Initialize conductor environment"
   ```

2. Announce completion:
   > "Setup complete! Your project now has:
   > - Product context in conductor/product.md
   > - Tech stack documented in conductor/tech-stack.md
   > - Development workflow in conductor/workflow.md
   > - First track ready in conductor/tracks/
   >
   > Next steps:
   > - Run `/conductor:implement` to start working on the first track
   > - Run `/conductor:newTrack` to create additional tracks
   > - Run `/conductor:status` to see project progress"
