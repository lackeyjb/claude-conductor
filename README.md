# Claude Conductor

Context-Driven Development framework for Claude Code.

> Inspired by [Conductor for Gemini CLI](https://github.com/gemini-cli-extensions/conductor)

## Overview

Conductor enables **Context-Driven Development** - a methodology where context is treated as a managed artifact alongside code. It provides:

- **Pre-implementation Planning**: Generate specs and plans before coding
- **Test-Driven Development**: Enforced Red-Green-Refactor cycles
- **Context Management**: Maintain style guides, tech stack, product goals
- **Iterative Safety**: Review plans before execution with checkpoints
- **Intelligent Reversion**: Git-aware rollback of logical work units

## Installation

### Development / Testing

Load the plugin directly using the `--plugin-dir` flag:

```bash
claude --plugin-dir /path/to/conductor
```

**Verify installation:**
```bash
# Start Claude Code with the plugin
claude --plugin-dir /path/to/conductor

# Type /conductor: to see available commands
/conductor:
```

You should see the 5 conductor commands listed.

### Production (via GitHub Marketplace)

Add the GitHub repository as a marketplace and install:

```bash
# Add this repository as a marketplace
/plugin marketplace add lackeyjb/claude-conductor

# Install the plugin
/plugin install conductor@claude-conductor
```

### Symlink Installation (Alternative)

```bash
# Create plugins directory if it doesn't exist
mkdir -p ~/.claude/plugins

# Symlink the conductor plugin
ln -s /path/to/conductor ~/.claude/plugins/conductor
```

## Commands

### `/conductor:setup`

Initialize Conductor environment for a project.

**Usage:**
```
/conductor:setup [brownfield|greenfield]
```

**Arguments:**
- `brownfield` - Skip detection, treat as existing project
- `greenfield` - Skip detection, treat as new project

**What it does:**
1. Detects project maturity (brownfield vs greenfield)
2. Creates `conductor/` directory with context files
3. Interactively generates `product.md`, `tech-stack.md`, `workflow.md`
4. Creates first track with specification and plan

**Example:**
```
> /conductor:setup

Existing project detected. I'll analyze it to understand the current state.
Found: package.json, src/, .git

What do you want to build? [describe your first feature]
```

---

### `/conductor:new-track`

Create a new feature, bug, or chore track.

**Usage:**
```
/conductor:new-track [description]
```

**Arguments:**
- `description` - Brief description of the work (optional, will prompt if not provided)

**What it does:**
1. Infers track type (feature/bug/chore) from description
2. Delegates to planner agent for interactive Q&A
3. Generates `spec.md` with requirements
4. Generates `plan.md` with TDD-structured tasks
5. Creates track directory and updates `tracks.md`

**Example:**
```
> /conductor:new-track Add user authentication with OAuth

Creating feature track...
I have some questions to clarify the requirements:
1. Which OAuth providers should be supported?
2. Should we include "remember me" functionality?
...
```

---

### `/conductor:implement`

Execute tasks following TDD workflow.

**Usage:**
```
/conductor:implement [<track-name>] [--all]
```

**Arguments:**
- `<track-name>` - Partial name to select specific track (optional, selects next incomplete)
- `--all` - Run all phases instead of one at a time

**What it does:**
1. Selects next incomplete track (or specified track)
2. **Single-phase mode (default)**: Shows interactive phase selection, implements one phase at a time
3. **All-phases mode (`--all`)**: Implements all remaining phases continuously
4. Delegates each task to implementer agent
5. Follows TDD cycle: Red → Green → Refactor
6. Creates atomic commits with git notes
7. Triggers phase verification at phase boundaries
8. Creates checkpoints with reviewer agent

**Examples:**
```
> /conductor:implement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Track: User Authentication

  [x] Phase 1: Setup                    [complete]
  [ ] Phase 2: Backend API              [in progress - 2/5 tasks]
  [ ] Phase 3: Frontend Integration     [pending]

  Which phase would you like to implement?

  A) Phase 2: Backend API (recommended)
  B) Phase 3: Frontend Integration
  C) All remaining phases
```

```
> /conductor:implement --all

Running all remaining phases for track 'User Authentication'.
Current task: Implement JWT validation

[RED] Writing failing test...
[GREEN] Implementing to pass...
[REFACTOR] Cleaning up...

Task complete. Commit: feat(auth): Implement JWT validation [a1b2c3d]
```

---

### `/conductor:status`

Display project progress report.

**Usage:**
```
/conductor:status
```

**What it does:**
1. Parses all tracks and plans
2. Calculates completion percentages
3. Identifies current focus (in-progress track/phase/task)
4. Lists any blockers
5. Shows next actions

**Example output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CONDUCTOR STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT FOCUS
───────────────────────────────────────────────────
  Track: User Authentication
  Phase: Backend API [~]
  Task:  Implement JWT validation [~]

PROGRESS
───────────────────────────────────────────────────
  [████████████░░░░░░░░] 60%  (12/20 tasks)
```

---

### `/conductor:agents`

Manage background Conductor agents and git worktrees.

**Usage:**
```
/conductor:agents [status|results|worktrees|cleanup]
```

**Arguments:**
- `status` (default) - Check background agent status
- `results` - Retrieve results from completed agents
- `worktrees` - List git worktrees used for isolation
- `cleanup` - Remove orphaned worktrees

**What it does:**
1. Lists running background agents (implementer, planner, reviewer)
2. Shows worktree isolation status
3. Retrieves completed agent results
4. Merges and cleans up worktree branches

**Example:**
```
> /conductor:agents

Background Agents:
  [RUNNING] implementer - Task: Add user validation (worktree: .worktrees/implementer-1735075200)

Worktrees:
  .worktrees/implementer-1735075200 → conductor/implementer-1735075200
```

```
> /conductor:agents results

Implementer completed:
  ✓ 3 tasks completed
  ✓ 4 commits created
  ✓ Checkpoint: a1b2c3d

Merging worktree back to main...
```

---

### `/conductor:revert`

Git-aware rollback of tracks, phases, or tasks.

**Usage:**
```
/conductor:revert [track|phase|task] [name]
```

**Arguments:**
- `track <name>` - Revert entire track
- `phase <name>` - Revert specific phase
- `task <name>` - Revert specific task

**What it does:**
1. Identifies all commits associated with the target
2. Finds both implementation and plan update commits
3. Presents revert plan for confirmation
4. Executes `git revert` in correct order
5. Handles conflicts with user guidance
6. Updates plan.md status markers

**Example:**
```
> /conductor:revert phase "Backend API"

I have analyzed the git history. Here is the revert plan:

Commits to revert (newest first):
  1. b2c3d4e - conductor(plan): Complete 'Add rate limiting'
  2. a1b2c3d - feat(api): Add rate limiting to endpoints

Do you want to proceed? [Y/n]
```

## Configuration

### Workflow Customization

Edit `conductor/workflow.md` after setup to customize:

| Setting | Default | Description |
|---------|---------|-------------|
| Coverage Target | 80% | Minimum test coverage percentage |
| Commit Strategy | Per Task | When to commit (per-task or per-phase) |
| Git Notes | Enabled | Attach summaries to commits |
| Mobile Testing | If Applicable | Require mobile verification |
| Parallel Agents | worktree | Strategy for parallel agent execution |

### Quality Gates

The workflow enforces these checks before task completion:

- All tests pass
- Code coverage meets target (>80%)
- Code follows style guides
- No linting errors
- Type safety enforced
- Documentation updated

### Code Styleguides

Language-specific style guides are provided in `templates/code-styleguides/`:

- TypeScript
- Python
- Go
- JavaScript
- HTML/CSS

During `/conductor:setup`, selected styleguides are copied to `conductor/code_styleguides/` based on your tech stack. The `code-styleguides` skill auto-activates when writing code, reading from your project's styleguide files.

## Background Execution & Parallel Agents

Conductor supports running agents in the background for long-running tasks and parallel workflows.

### When to Use Background Execution

```bash
# Run implementer in background for long task
> I want to implement user validation. Can you run that in the background while I work on something else?

# Run multiple tasks in parallel
> Start implementing authentication in the background, and I'll work on the frontend
```

### Parallel Agent Strategies

Configure in `conductor/workflow.md`:

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **worktree** (recommended) | Each background agent works in isolated git worktree | Parallel development without conflicts |
| **sequential** | Background agents queue, run one at a time | Safe fallback when worktrees not desired |
| **unsafe** | No isolation, agents work on same branch | Not recommended (manual conflict resolution) |

### How Worktree Isolation Works

When `parallel_agents: worktree`:

1. **Agent spawns**: Creates `.worktrees/implementer-<id>/` with separate branch
2. **Isolated work**: All file changes happen in worktree directory
3. **On completion**: Branch merges back to main automatically
4. **Cleanup**: Worktree and branch removed after merge

**Benefits:**
- ✅ No git conflicts during parallel execution
- ✅ Each agent has independent workspace
- ✅ Clean merge history with `--no-ff`
- ✅ Automatic cleanup on success

**Example:**
```bash
> /conductor:agents

Background Agents:
  [RUNNING] implementer - worktree: .worktrees/implementer-1735075200

# Agent completes...

> /conductor:agents results

Implementer completed. Merging worktree...
✓ Merged conductor/implementer-1735075200 → main
✓ Removed worktree
```

### Skills Auto-Loading

Agents now preload skills at startup for faster context loading:

| Agent | Preloaded Skills |
|-------|-----------------|
| **planner** | context-awareness |
| **implementer** | context-awareness, tdd-workflow, code-styleguides |
| **reviewer** | context-awareness |

This ensures agents have immediate access to:
- Project context (product.md, tech-stack.md, workflow.md)
- TDD methodology (Red-Green-Refactor cycle)
- Language-specific style guidelines

## Project Structure

When initialized, Conductor creates:

```
your-project/
└── conductor/
    ├── product.md           # Product vision and goals
    ├── product-guidelines.md # Brand and design standards
    ├── tech-stack.md        # Technology choices
    ├── workflow.md          # Development methodology
    ├── setup_state.json     # Resume capability state
    ├── tracks.md            # Track overview
    └── tracks/
        └── <track_id>/
            ├── spec.md      # Requirements specification
            ├── plan.md      # Implementation plan
            └── metadata.json
```

## Troubleshooting

### Common Errors

**"Conductor is not set up"**
```
Run /conductor:setup first to initialize the conductor/ directory.
```

**"No tracks found"**
```
Run /conductor:new-track to create your first track.
```

**"You have uncommitted changes"**
```
Commit or stash your changes before running /conductor:revert.
```

### Prerequisites

Before using Conductor:

1. **Git repository**: Project must be a git repo (or `/conductor:setup` will init one)
2. **Claude Code**: Version with plugin support
3. **Test framework**: Project should have testing set up for TDD workflow

### Debug Mode

For verbose output showing hook execution:

```bash
claude --verbose --plugin-dir /path/to/conductor
```

Check hook execution logs:
```
~/.claude/debug/
```

### Resuming Interrupted Setup

If setup is interrupted, it can be resumed:

```bash
# Setup saves state in conductor/setup_state.json
# Re-running setup will offer to resume from last successful step
/conductor:setup
```

### Session Resumption

Conductor automatically resumes work when starting a new session:

1. **SessionStart hook** detects conductor project and shows current status
2. **plan.md status markers** track progress (`[ ]` pending, `[~]` in-progress, `[x]` complete)
3. **Run `/conductor:implement`** to continue from where you left off

No special handoff files needed - plan.md is the single source of truth.

## Architecture

Conductor uses Claude Code's plugin system:

| Component | Purpose |
|-----------|---------|
| **Commands** (`/conductor:*`) | User-invoked actions |
| **Agents** | Specialized subagents with preloaded skills (planner, implementer, reviewer) |
| **Skills** | Auto-loaded capabilities via frontmatter (TDD, styleguides, context) |
| **Hooks** | Event-driven automation (context loading, change tracking) |
| **Worktrees** | Git isolation for parallel agent execution |

## Documentation

See the `reference/` directory for detailed documentation:

- [Implementation Blueprint](reference/implementation-blueprint.md)
- [Plugin Architecture](reference/plugin-architecture.md)
- [Claude Code Mapping](reference/claude-code-mapping.md)
- [Conductor Analysis](reference/conductor-analysis.md)

## License

Apache-2.0
