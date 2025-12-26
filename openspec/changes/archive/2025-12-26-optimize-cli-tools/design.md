# Design: Optimize CLI Tools

## Context
The CLI tools feature needs performance optimization, UI simplification, categorization, and better installation feedback. The current implementation:
- Runs detection sequentially, blocking on each tool
- Shows all information in cards, making them cluttered
- Has no category organization
- Provides minimal feedback during installation

## Goals / Non-Goals

### Goals
- Reduce CLI detection time by 50%+ through parallelization
- Simplify card UI to show only essential information
- Add category support matching software recommendations pattern
- Provide real-time installation logs and error feedback
- Extract shared category filter component for reuse

### Non-Goals
- Changing the detection algorithm itself (only parallelization)
- Adding new installation methods
- Changing the dependency resolution logic
- Modifying the template storage format (only extending with category/emoji)

## Decisions

### Decision: Parallel Detection
**What**: Run CLI tool detection in parallel using Rust's async/threading capabilities
**Why**: Sequential detection blocks on each tool's `which` and `get_version` calls. Parallel execution will significantly reduce total time.
**Alternatives considered**:
- Caching detection results: Still need initial detection, doesn't solve first load
- Lazy loading: Adds complexity, doesn't address refresh performance
**Implementation**: Use `rayon` or `tokio` for parallel execution, or spawn threads for each tool detection

### Decision: Simplified Card with Dialog and Grid Layout
**What**: Show minimal info in card (name, emoji, status badge, version), move details to clickable dialog, change layout from list to responsive grid
**Why**: Reduces visual clutter, improves scanability, matches modern UI patterns, and grid layout allows showing more items per screen with simplified cards
**Alternatives considered**:
- Collapsible sections: Still shows too much by default
- Separate detail page: Adds navigation complexity
- Keep list layout: Less efficient use of space with simplified cards
**Implementation**:
- Grid layout with responsive columns (1 on mobile, 2-3 on tablet, 3-4+ on desktop)
- Dialog shows: executable path, detection method (e.g., "detected by which <executable>"), config files, dependencies, install methods with specific commands (e.g., "brew install <formula>", "brew install --cask <cask>"), full description

### Decision: Shared Category Component
**What**: Extract `CategoryFilter` component to shared location, use by both software and CLI tools
**Why**: DRY principle, consistent UX across features
**Alternatives considered**:
- Separate components: Duplicates code and diverges UX
- Generic component with heavy props: Over-engineered for current needs
**Implementation**: Move to `src/components/` or `src/shared/components/`, accept generic category type

### Decision: Installation Progress Dialog
**What**: Show modal dialog with scrollable log output during installation
**Why**: Users need visibility into installation progress and errors
**Alternatives considered**:
- Toast notifications only: Not enough detail for debugging
- Separate page: Breaks workflow, adds navigation
**Implementation**: Dialog with:
  - Current tool name
  - Scrollable log output (stdout/stderr)
  - Progress indicator
  - Error highlighting
  - Close/cancel button

### Decision: Category in Templates
**What**: Add `category` and `emoji` fields to `CliToolTemplate` type
**Why**: Enables categorization and visual identification like software recommendations
**Alternatives considered**:
- Hardcoded categories: Not flexible, doesn't match software pattern
- Separate category mapping: Adds complexity
**Implementation**:
- Extend `CliToolTemplate` in Rust types
- Add default categories for built-in tools
- Allow custom tools to specify category

## Risks / Trade-offs

### Risk: Parallel Detection Overhead
**Mitigation**: Limit concurrency to reasonable number (e.g., 10-20 parallel tasks), measure actual improvement

### Risk: Breaking Changes to Template Format
**Mitigation**: Make category/emoji optional with defaults, maintain backward compatibility

### Risk: Dialog UX Interruption
**Mitigation**: Make dialog non-blocking where possible, allow background installation with notification

## Migration Plan

1. **Phase 1: Performance** - Parallel detection (no breaking changes)
2. **Phase 2: UI Simplification** - Card redesign + dialog (backward compatible)
3. **Phase 3: Categories** - Add category support (optional fields, defaults)
4. **Phase 4: Installation Feedback** - Progress dialog (additive feature)

No data migration needed - templates extended with optional fields.

## Open Questions
- Should we cache detection results between refreshes? (Deferred to future optimization)
- Should categories be user-configurable or fixed? (Start with fixed, allow extension later)

