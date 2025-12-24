---
name: code-styleguides
description: Language-specific code style guidelines. Use when writing TypeScript, Python, Go, JavaScript, or HTML/CSS code to ensure consistent, idiomatic, and maintainable code following best practices.
allowed-tools: Read, Glob
---

# Code Styleguides

Language-specific coding standards and best practices.

## How It Works

Reads project-level styleguides from `conductor/code_styleguides/` (copied during `/conductor:setup` based on tech stack).

## Supported Languages

| Language | Extensions | Styleguide File |
|----------|------------|-----------------|
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` | `conductor/code_styleguides/typescript.md` |
| Python | `.py`, `.pyi` | `conductor/code_styleguides/python.md` |
| Go | `.go` | `conductor/code_styleguides/go.md` |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` | `conductor/code_styleguides/javascript.md` |
| HTML/CSS | `.html`, `.css`, `.scss`, `.sass` | `conductor/code_styleguides/html-css.md` |

## When to Activate

Writing new code, reviewing code, refactoring, or setting up new files/modules.

## Universal Principles

| Aspect | Guideline |
|--------|-----------|
| **Naming** | Descriptive, meaningful; clarity over brevity; consistency |
| **Structure** | Single responsibility; max 3-4 nesting levels; group related code |
| **Documentation** | Document "why" not "what"; keep updated; docstrings for public APIs |
| **Errors** | Handle explicitly; fail fast with clear messages; never swallow |
| **Testing** | Write alongside code (TDD); test behavior not implementation; high coverage on critical paths |

## Quick Reference

| Setting | Recommendation |
|---------|----------------|
| Line length | 80-120 characters |
| Indentation | 2 spaces (JS/TS), 4 spaces (Python), tabs (Go) |
| Naming | Follow language conventions |
| Imports | Organized and grouped |
| Comments | Minimal, meaningful |

## Setup

If styleguides missing:
1. Run `/conductor:setup` to initialize
2. Or copy from `templates/code-styleguides/` to `conductor/code_styleguides/`

Check: `ls conductor/code_styleguides/`

## Integration

Works with: **conductor-context** (project overrides), **tdd-workflow** (language test patterns)
