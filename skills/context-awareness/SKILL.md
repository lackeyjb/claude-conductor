---
name: conductor-context
description: Auto-load Conductor project context when conductor/ directory exists. Use for any development task in a Conductor-managed project to ensure alignment with product goals, tech stack, and workflow methodology.
allowed-tools: Read, Glob
---

# Conductor Context Awareness

Automatic context loading for Conductor-managed projects.

## When to Activate

When `conductor/` directory exists and user is: implementing tasks, working on features/bugs, or mentions "plan"/"tracks".

## Context Files

| File | Contains | Use For |
|------|----------|---------|
| `product.md` | Vision, goals, users, features, metrics | The WHY |
| `tech-stack.md` | Languages, frameworks, DBs, libraries, architecture | The HOW |
| `workflow.md` | Methodology (TDD), coverage, commits, quality gates | The PROCESS |
| `tracks.md` | All tracks (features/bugs), status, priorities | The WHAT |
| `code_styleguides/` | Language-specific standards, conventions, practices | The STYLE |

## Workflow Reference

| Need | Read |
|------|------|
| Coverage target | workflow.md |
| Commit format | workflow.md |
| Test methodology | workflow.md |
| Technology choices | tech-stack.md |
| Coding style | code_styleguides/ |
| Current focus | tracks.md |

## Loading Sequence

**Before starting implementation:**
1. Check `tracks.md` for current track
2. Read track's `spec.md` for requirements
3. Read track's `plan.md` for tasks
4. Follow `workflow.md` methodology

**Full context load order:**
1. `product.md` (why)
2. `tech-stack.md` (how)
3. `tracks.md` (what)
4. Track's `spec.md` and `plan.md`

## Quick Commands

```bash
# Find in-progress items
grep -r "\[~\]" conductor/tracks/*/plan.md

# Count by status
grep -c "\[ \]" conductor/tracks.md   # Pending
grep -c "\[~\]" conductor/tracks.md   # In progress
grep -c "\[x\]" conductor/tracks.md   # Complete
```

## Integration

Works with: **tdd-workflow** (TDD guidance), **code-styleguides** (language conventions)
