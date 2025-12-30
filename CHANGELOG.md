# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-12-29

### Changed
- Session resumption now relies solely on plan.md status markers instead of automatic context threshold tracking

### Removed
- Automatic context threshold tracking and handoff mechanism
- context-threshold.js hook and related Task hook configuration
- Handoff sections from implement command documentation

### Documentation
- Added session resumption documentation to README.md
- Simplified workflow documentation

## [1.1.1] - 2024-12-27

### Added
- Agents and commands now inherit model from parent context when not explicitly set

### Fixed
- Prevent CPU spikes from unbounded parallel file operations in hooks
- Optimize stdin reading in all hook scripts (array collection vs string concatenation)
- Add orphan worktree detection warning on session start
- Document resource limits for concurrent background agents

## [1.0.1] - 2024-12-24

### Fixed
- Agent type references in commands now use fully-qualified names (conductor:planner, conductor:implementer, conductor:reviewer)

## [1.0.0] - 2024-12-24

### Added
- Skills preloading, background agents, and worktree isolation
- Plugin marketplace support with marketplace.json
- Single-phase execution mode with interactive selection
- Context threshold auto-handoff feature
- Code styleguides moved to templates system
- Phase 5 templates and documentation
- Phase 4 hooks automation
- Phase 3 skills integration
- Graceful file existence checks before reading
- Context threshold notification when reached

### Performance
- Parallel tool call instructions across all commands and agents
- Optimized plugin for reduced token usage and faster execution

### Changed
- Updated command references to use kebab-case
- Renamed agents to remove conductor- prefix
- Set explicit models for agents and commands
- Updated model strings throughout

### Fixed
- Source path now uses ./ prefix in marketplace.json
- Improved error handling with graceful file checks

### Documentation
- Updated README title to Claude Conductor
- Enhanced installation instructions with GitHub marketplace
- Added specific Bash commands for pre-flight checks

## [0.1.0] - Initial Release

### Added
- Initial Context-Driven Development framework
- Basic planner, implementer, and reviewer agents
- Core command structure
