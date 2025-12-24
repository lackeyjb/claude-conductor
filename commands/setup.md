---
description: Initialize Conductor environment for context-driven development
argument-hint: [project-type]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
model: claude-opus-4-5-20251101
---

# Conductor Setup

You are initializing the Conductor context-driven development environment. Follow this protocol precisely.

## Pre-flight Check

1. **Check for existing setup**:

   - Use Bash to test if `conductor/setup_state.json` exists: `test -f conductor/setup_state.json && echo "exists" || echo "not found"`
   - If "exists", read the file and offer to resume from last successful step
   - If `last_successful_step` is "complete", inform user setup is already done
   - If "not found", proceed with fresh setup

2. **Check for conductor directory**:
   - Use Bash to test if `conductor/` exists: `test -d conductor && echo "exists" || echo "not found"`
   - If "exists" but no state file found, warn about potential overwrite
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

**Purpose**: Copy language-specific style guides based on the project's tech stack.

**Process**:

1. Read `conductor/tech-stack.md` to detect languages
2. Map detected languages to available styleguides:
   - TypeScript/Node.js → `typescript.md`
   - Python → `python.md`
   - Go/Golang → `go.md`
   - JavaScript → `javascript.md`
   - HTML/CSS/Frontend → `html-css.md`
3. Present detected languages: "Based on your tech stack, I'll include styleguides for: [list]"
4. Ask: "Would you like to add styleguides for any other languages?"
   - Options: TypeScript, Python, Go, JavaScript, HTML/CSS (only show ones not already selected)
   - Allow multiple selections
5. Create `conductor/code_styleguides/` directory
6. Copy selected styleguide files from `templates/code-styleguides/` to `conductor/code_styleguides/`
7. Inform user: "You can customize these styleguides by editing files in `conductor/code_styleguides/`"

Update state: `{"last_successful_step": "2.4_code_styleguides"}`

### 2.5 Workflow (`conductor/workflow.md`)

Copy default workflow template, then ask:

1. Test coverage target? (default: 80%)
2. Commit after each task or phase? (default: task)
3. Use git notes for summaries? (default: yes)

Update state: `{"last_successful_step": "2.5_workflow"}`

## Phase 3: Initial Track

### 3.1 Determine Initial Track Description

**Greenfield:** Ask user what they want to build first (MVP focus)
**Brownfield:** Ask what enhancement or improvement they want to start with

Get a brief description of the initial track from the user.

### 3.2 Delegate to Planner Agent

ALWAYS use the Task tool to delegate track creation to the planner agent:

```
Task tool:
- subagent_type: 'planner'
- prompt: |
    Create specification and plan for initial track: <description>

    Project type: <brownfield|greenfield>

    Context files to read:
    - conductor/product.md
    - conductor/tech-stack.md
    - conductor/workflow.md

    Requirements:
    1. Conduct interactive questioning (3-5 questions)
    2. Generate spec.md following template structure
    3. Generate plan.md with TDD task structure
    4. Each phase must end with verification task

    Return both artifacts for user review.
```

The planner agent will:

- Conduct interactive questioning to understand requirements
- Generate spec.md with functional/non-functional requirements
- Generate plan.md with TDD-structured tasks
- Return artifacts for review

### 3.3 Create Track Artifacts

After planner returns artifacts:

1. Generate track ID: `<shortname>_YYYYMMDD`
2. Create `conductor/tracks.md` with first track entry
3. Create `conductor/tracks/<track_id>/`
4. Write `spec.md` (from planner output)
5. Write `plan.md` (from planner output)
6. Create `metadata.json`:
   ```json
   {
     "track_id": "<track_id>",
     "type": "feature",
     "status": "new",
     "created_at": "<ISO timestamp>",
     "updated_at": "<ISO timestamp>",
     "description": "<description>"
   }
   ```

Update state: `{"last_successful_step": "complete"}`

## Completion

1. Commit all conductor files:

   ```
   git add conductor/
   git commit -m "conductor(setup): Initialize conductor environment"
   ```

2. Announce completion:
   > "Setup complete! Your project now has:
   >
   > - Product context in conductor/product.md
   > - Tech stack documented in conductor/tech-stack.md
   > - Development workflow in conductor/workflow.md
   > - First track ready in conductor/tracks/
   >
   > Next steps:
   >
   > - Run `/conductor:implement` to start working on the first track
   > - Run `/conductor:new-track` to create additional tracks
   > - Run `/conductor:status` to see project progress"
