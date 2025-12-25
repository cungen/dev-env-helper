# Change: Add Software Recommendations Feature

## Why
Users need a curated way to discover and install recommended development software. The current CLI management feature focuses on tools already known to the user, but there's no discovery mechanism for finding new tools. An app store-like interface with categories, visual icons (emojis), and descriptions will help users discover useful software. The feature should integrate with existing installation methods (Homebrew) and add support for GitHub releases to provide a comprehensive installation experience.

## What Changes
- **NEW**: Software recommendations page accessible from sidebar navigation
- **NEW**: JSON-based configuration file for recommended software entries
- **NEW**: App store-like UI with grid layout, categories, emoji icons, and descriptions
- **NEW**: GitHub release detection and version fetching for software distributed via GitHub
- **NEW**: Install button integration with existing brew installation system
- **NEW**: Download button for GitHub releases with version information display
- **MODIFIED**: Navigation system to include new "Software" tab

## Impact
- **Affected specs**:
  - `ui-navigation` - Adding new navigation tab
  - `cli-installation` - Extending to support GitHub releases
- **Affected code**:
  - `src/App.tsx` - Register new feature tab
  - `src/features/software-recommendations/` - New feature module (components, hooks, types, API)
  - `src-tauri/src/` - New Rust commands for GitHub API and JSON config loading
  - JSON configuration file location (to be determined in design)
- **New dependencies**:
  - HTTP client for GitHub API (reqwest or similar in Rust)
  - JSON parsing for software configuration

## Success Criteria
1. Users can browse recommended software organized by categories
2. Each software entry displays emoji icon, name, description, and category
3. Software with Homebrew support shows install button with method indicator
4. Software from GitHub releases shows latest version and download button
5. Installation integrates seamlessly with existing brew installation system
6. GitHub release fetching works reliably with proper error handling
7. Configuration is easily editable via JSON file

## Risks & Mitigations
- **Risk**: GitHub API rate limiting may affect release fetching
  - **Mitigation**: Cache release information, implement retry logic, show cached data if API fails
- **Risk**: JSON configuration file location and format may need changes
  - **Mitigation**: Use standard OS app data directory, provide clear schema documentation
- **Risk**: GitHub release detection may fail for non-standard repository structures
  - **Mitigation**: Validate repository URL format, handle edge cases gracefully with clear error messages

## Related Specs
- `ui-navigation` - Feature tab registration
- `cli-installation` - Installation method integration
- `cli-management` - Similar UI patterns for tool display

## Dependencies
- HTTP client library for Rust (reqwest) for GitHub API calls
- JSON configuration file structure design
- GitHub API authentication (optional, for higher rate limits)


