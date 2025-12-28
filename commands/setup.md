---
description: Initialize Conductor environment for context-driven development
argument-hint: [project-type]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
model: inherit
---

# Conductor Setup

Initialize Conductor context-driven development environment. Follow protocol precisely.

## Pre-flight Check

1. **Check existing setup:** Test `conductor/setup_state.json`. If exists:
   - Read and offer resume from `last_successful_step`
   - If step is "complete", inform setup is done
2. **Check conductor directory:** If exists without state file, warn about overwrite. Confirm before proceeding.

## Phase 1: Project Discovery

### 1.1 Detect Project Maturity

**Check brownfield indicators in parallel (3 Bash calls in one response):**

1. **Git check:**
   ```bash
   test -d .git && echo "git:yes" || echo "git:no"
   ```

2. **Manifest check:**
   ```bash
   ls package.json requirements.txt go.mod pom.xml Cargo.toml 2>/dev/null | head -1 || echo "manifest:none"
   ```

3. **Source directories check:**
   ```bash
   ls -d src app lib 2>/dev/null | head -1 || echo "src:none"
   ```

**Evaluation:**
- **Brownfield:** Any indicator returns positive result
- **Greenfield:** All checks return negative/none, directory empty or only README

> **Performance note:** Running these checks in parallel speeds up project discovery.

### 1.2 Execute by Maturity

| Type | Actions |
|------|---------|
| Brownfield | Announce analysis. Check git status (warn uncommitted). Analyze README, manifest files (respect .gitignore). Infer tech stack, architecture, goals. Present findings for confirmation. |
| Greenfield | Announce new project. Init git if needed. Ask "What do you want to build?" Create `conductor/`. Write initial concept to `product.md`. |

### 1.3 Initialize State

Create `conductor/setup_state.json` with project_type and created_at timestamp.

## Phase 2: Context Generation

For each section: (1) Introduce, (2) Ask questions (AskUserQuestion with options + "Type your own" + "Auto-generate"), (3) Draft content, (4) Present for approval, (5) Write file, (6) Update state.

| Section | File | Questions | State Step |
|---------|------|-----------|------------|
| Product Guide | `product.md` | Target users? Problems solved? Key features? Success metrics? | 2.1_product_guide |
| Product Guidelines | `product-guidelines.md` | Brand voice/tone? Design standards? Communication style? | 2.2_product_guidelines |
| Tech Stack | `tech-stack.md` | Brownfield: Confirm inferred stack. Greenfield: Languages, frameworks, databases? | 2.3_tech_stack |
| Code Styleguides | `code_styleguides/*.md` | Detect languages from tech-stack.md. Map to available guides (typescript, python, go, javascript, html-css). Copy templates. Ask if adding others. | 2.4_code_styleguides |
| Workflow | `workflow.md` | Copy template. Ask: Coverage target (default 80%)? Commit per task/phase (default task)? Use git notes (default yes)? | 2.5_workflow |

## Phase 3: Initial Track

### 3.1 Get Track Description

**Greenfield:** Ask what to build first (MVP focus)
**Brownfield:** Ask what enhancement/improvement to start with

### 3.2 Delegate to Planner

ALWAYS use Task tool:
```
Task tool:
- subagent_type: 'conductor:planner'
- prompt: |
    Create spec and plan for initial track: <description>
    Project type: <brownfield|greenfield>

    Context files: product.md, tech-stack.md, workflow.md

    Generate spec.md and plan.md with TDD task structure.
    Return artifacts for review.
```

### 3.3 Create Track Artifacts

After planner returns:
1. Generate track ID: `<shortname>_YYYYMMDD`
2. Create `tracks.md` with first track entry
3. Create `tracks/<track_id>/` with spec.md, plan.md, metadata.json
4. Update state: `"complete"`

## Completion

1. **Commit:**
   ```bash
   git add conductor/ && git commit -m "conductor(setup): Initialize environment"
   ```

2. **Announce:**
   ```
   Setup complete! Project now has:
   - Product context in conductor/product.md
   - Tech stack in conductor/tech-stack.md
   - Workflow in conductor/workflow.md
   - First track in conductor/tracks/

   Next: /conductor:implement to start working
   ```
