# Conductor

Context-Driven Development framework for Claude Code.

> Inspired by [Conductor for Gemini CLI](https://github.com/gemini-cli-extensions/conductor)

## Installation

### Development / Testing

Load the plugin directly using the `--plugin-dir` flag:

```bash
claude --plugin-dir /path/to/conductor
```

### Production (via Marketplace)

Once published to a marketplace, install with:

```bash
claude plugin install conductor@<marketplace-name>
```

## Commands

| Command | Description |
|---------|-------------|
| `/conductor:setup` | Initialize Conductor environment for a project |
| `/conductor:newTrack` | Create a new feature, bug, or chore track |
| `/conductor:implement` | Execute tasks following TDD workflow |
| `/conductor:status` | Display project progress report |
| `/conductor:revert` | Git-aware rollback of tracks, phases, or tasks |

## Quick Start

1. Start Claude Code with the plugin: `claude --plugin-dir /path/to/conductor`
2. Navigate to your project directory
3. Run `/conductor:setup` to initialize
4. Run `/conductor:newTrack` to create your first track
5. Run `/conductor:implement` to start working

## How It Works

Conductor establishes a structured development workflow:

1. **Setup** creates project context files (`conductor/product.md`, `conductor/tech-stack.md`, etc.)
2. **Tracks** represent units of work (features, bugs, chores) with specifications and plans
3. **Implementation** follows TDD methodology with checkpoints and verification
4. **Status** provides visibility into project progress
5. **Revert** enables safe rollback to previous states

## Project Structure

When initialized, Conductor creates:

```
your-project/
└── conductor/
    ├── product.md           # Product vision and goals
    ├── product-guidelines.md # Brand and design standards
    ├── tech-stack.md        # Technology choices
    ├── workflow.md          # Development methodology
    ├── tracks.md            # Track overview
    └── tracks/
        └── <track_id>/
            ├── spec.md      # Requirements specification
            ├── plan.md      # Implementation plan
            └── metadata.json
```

## Documentation

See the `reference/` directory for detailed documentation:

- [Implementation Blueprint](reference/implementation-blueprint.md)
- [Plugin Architecture](reference/plugin-architecture.md)
- [Claude Code Mapping](reference/claude-code-mapping.md)

## License

Apache-2.0
