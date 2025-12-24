---
name: tdd-workflow
description: Test-Driven Development guidance. Use when writing code, implementing features, or fixing bugs in projects that follow TDD methodology. Provides the Red-Green-Refactor cycle structure.
---

# TDD Workflow Skill

Guidance for Test-Driven Development methodology.

## The Core Cycle

**RED → GREEN → REFACTOR** (repeat)

| Phase | Purpose | Actions | Verify |
|-------|---------|---------|--------|
| **RED** | Define expected behavior | Write test for ONE behavior, run test | Test FAILS |
| **GREEN** | Make it work | Write MINIMUM code to pass | Test PASSES |
| **REFACTOR** | Make it clean | Improve ONE thing at a time, run tests after each change | Tests stay GREEN |

## Phase 1: RED - Write Failing Test

**Purpose:** Define behavior before implementation.

**Actions:**
1. Create/open test file
2. Write test for ONE behavior
3. Run test
4. Verify FAILURE (if it passes, test is wrong)

**Common mistakes:** Tests pass immediately, testing implementation not behavior, writing too many tests at once

## Phase 2: GREEN - Make It Pass

**Purpose:** Write MINIMUM code to pass test.

**Actions:**
1. Implement just enough to pass
2. No extra features, no optimization
3. Run tests, verify PASS

**Common mistakes:** Over-engineering, adding untested features, "while I'm here" additions

## Phase 3: REFACTOR - Improve Quality

**Purpose:** Clean up while keeping tests green.

**Actions:**
1. Identify improvements: duplication, naming, complex logic, long functions
2. Make ONE change
3. Run tests
4. If green, continue. If red, undo.

**Checklist:** Extract methods, rename variables, remove duplication (DRY), simplify conditionals, add type safety

## Test Patterns

**Arrange-Act-Assert (AAA):**
1. Arrange: Set up test data
2. Act: Execute the behavior
3. Assert: Verify result

**Given-When-Then (BDD):** Structure nested describes for readability

## Coverage Commands

| Language | Command |
|----------|---------|
| JS/TS (Jest) | `npx jest --coverage` |
| JS/TS (Vitest) | `npx vitest run --coverage` |
| Python | `pytest --cov=src --cov-report=html` |
| Go | `go test -cover ./...` |

## Anti-Patterns to Avoid

1. **Test After:** Writing code first defeats TDD purpose
2. **Testing Implementation:** Test WHAT it does, not HOW (test behavior, not internal calls)
3. **Brittle Tests:** Use resilient assertions (e.g., `toContainEqual` not array index checks)
4. **No Refactoring:** Skipping refactor creates technical debt

## Quick Reference

- RED: "What should it do?" → Write failing test
- GREEN: "Does it work?" → Write minimal code
- REFACTOR: "Is it clean?" → Improve structure

**For detailed code examples**, see `examples.md` in this skill directory.

## Integration

Works with:
- **context-awareness**: Project-specific coverage targets
- **code-styleguides**: Language-specific test patterns
