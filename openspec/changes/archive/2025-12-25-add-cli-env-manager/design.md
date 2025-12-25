# Design: CLI Environment Manager

## Context

This is the foundational feature for dev-env-helper, a Tauri desktop application for managing development environments. The application runs locally and needs to:
- Interact with the OS to detect installed CLI tools
- Store and retrieve configuration data
- Provide a clean, extensible UI for multiple future features

**Constraints:**
- macOS-only for initial implementation (can extend to Linux/Windows later)
- Local-only operation (no backend/cloud services)
- Simple, straightforward implementation to start

## Goals / Non-Goals

### Goals
- Unified interface for viewing and managing CLI tools
- One-click installation of missing CLI tools via Homebrew or DMG download
- Dependency-aware installation that automatically installs required tools first
- Visual dependency graph showing relationships between tools
- Real-time installation progress feedback
- Portable environment configuration via JSON export/import
- Extensible architecture for adding custom CLI tools
- Scalable navigation pattern for future features

### Non-Goals
- Version management or switching between versions (out of scope for MVP)
- Cloud sync or remote configuration storage
- Complex plugin system (template-based extension is sufficient)
- Cross-platform package manager support (macOS brew + DMG only for MVP)

## Decisions

### 1. Architecture: Feature-Based Frontend Modules
**Decision**: Organize frontend code by feature under `src/features/`

Each feature is a self-contained module with:
- `components/` - React components specific to the feature
- `hooks/` - Custom React hooks for feature logic
- `types/` - TypeScript types/interfaces
- `api/` - Tauri command wrappers

**Rationale**:
- Clear separation of concerns
- Easy to add new features without touching existing code
- Aligns with common React patterns

**Alternatives considered**:
- *Layered architecture (components, services, utils)*: More overhead for small app
- *Single components directory*: Harder to find related code as app grows

### 2. CLI Tool Abstraction: Template-Based Definition
**Decision**: CLI tools defined as JSON templates with detection patterns

```typescript
interface CliToolTemplate {
  id: string;
  name: string;
  executable: string;           // Command name to check in PATH
  versionCommand: string;       // e.g., "--version", "-v"
  versionParser: "stdout" | "stderr" | "stdout-first-line";
  configFiles: ConfigFileLocation[];
  installMethods?: InstallMethod[];  // Installation options
  dependencies?: string[];           // NEW: List of tool IDs that must be installed first
}

interface InstallMethod {
  type: "brew" | "dmg" | "script";  // macOS: brew cask or DMG download
  brewCaskName?: string;             // For brew: "node", "python", etc.
  dmgUrl?: string;                   // For DMG: URL to download
  dmgInstallSteps?: string[];        // Instructions after DMG opens
}

interface ConfigFileLocation {
  path: string;                 // May include ~ or env vars
  description: string;
}
```

Built-in templates shipped with app; custom templates stored in user config directory.

**Rationale**:
- No code changes needed to add new CLI tools
- Users can extend without modifying source
- Simple to validate and parse

**Alternatives considered**:
- *Plugin system with dynamic loading*: Over-engineering for initial version
- *Hardcoded detection for each tool*: Not extensible

### 3. State Management: React Component State + Tauri Commands
**Decision**: Use local React state (useState) with direct Tauri command invocation

**Rationale**:
- Simple and sufficient for current scope
- No global state needed yet
- Easy to migrate to Zustand/Redux if complexity grows

**Alternatives considered**:
- *Zustand/Redux from start*: Unnecessary complexity for MVP
- *React Query*: Useful for caching, but adds dependency

### 4. Data Persistence: JSON File in App Data Directory
**Decision**: Store user configuration and custom templates in JSON files in OS app data directory

- Location: `~/.config/dev-env-helper/` on Linux, `~/Library/Application Support/dev-env-helper/` on macOS, `%APPDATA%/dev-env-helper/` on Windows
- Files: `cli-config.json`, `custom-tools.json`

**Rationale**:
- Simple, human-editable if needed
- No database overhead
- Easy to backup as part of export

**Alternatives considered**:
- *SQLite*: Overkill for structured config data
- *Tauri Store API*: Simpler to use plain JSON files

### 5. UI Navigation: Sidebar with Collapsible Sections
**Decision**: Vertical sidebar on the left with tab buttons for each feature

- Sidebar width: 240px expanded, 60px collapsed
- Icon + label for each tab
- Active tab highlighted
- Collapse button at bottom

**Rationale**:
- Scalable for many future features
- Common pattern in dev tools (VS Code, etc.)
- Consistent with user expectations

**Alternatives considered**:
- *Top navigation bar*: Harder to scale with many items
- *Drawer/panel*: Adds clicking overhead

### 6. CLI Installation: Brew + DMG Methods
**Decision**: Support two installation methods on macOS - Homebrew and DMG download

**Homebrew Installation:**
- Execute `brew install <cask-name>` directly from Tauri
- Stream command output in real-time to frontend
- Show terminal-like panel with live output
- Display success/failure status when complete

**DMG Installation:**
- Download DMG file to Downloads folder
- Automatically open the DMG with Finder after download
- Display install instructions in the UI
- User drags app to Applications folder manually

**Fallback:** If no install method defined, show generic install instructions with link to official docs.

**Rationale**:
- Homebrew is most convenient for developers (one-click, fully automated)
- DMG is universal fallback for GUI apps
- Real-time feedback is important for long-running brew installs
- Auto-opening DMG reduces user friction while maintaining safety

**Alternatives considered**:
- *Shell script installers*: Less secure, harder to verify source
- *Manual instructions only*: Poor UX, doesn't add value over browser
- *Package manager abstraction*: Over-engineering for macOS-only MVP

### 8. Export Format: Single JSON File
**Decision**: Export all environment data to a single JSON file with schema version

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-25T14:00:00Z",
  "tools": [
    {
      "id": "node",
      "installed": true,
      "version": "22.11.0",
      "configSnapshot": { /* ... }
    }
  ]
}
```

**Rationale**:
- Simple to parse and validate
- Human-readable for manual editing if needed
- Easy to extend with schema versioning

**Alternatives considered**:
- *YAML*: Adds dependency, less common in JS ecosystem
- *Multiple files*: More complex to manage

### 7. CLI Tool Dependencies: Declaration and Resolution
**Decision**: Tools can declare dependencies on other tools; system resolves and installs them in topological order

**Dependency Declaration:**
- Each tool template can optionally include a `dependencies` array of tool IDs
- Example: `uv` depends on `python3`, `n` depends on `node`
- Dependencies are validated to reference existing tool IDs

**Resolution Algorithm:**
- Use topological sort to determine installation order
- Detect circular dependencies and report as template validation error
- Skip already-installed dependencies when planning installation

**Installation Behavior:**
- When user installs a tool, show notification: "Installing X and its dependencies: Y, Z"
- Display all tools that will be installed in the installation queue
- Install dependencies first, then the target tool
- If any dependency installation fails, stop and report error
- Allow user to review dependency tree before installing

**UI Representation:**
- Tool cards show dependency count badge (e.g., "Requires 2 tools")
- Click to expand and view dependency tree
- Visual indicators in the install queue showing which tools are dependencies
- Color coding: dependencies shown with different visual treatment

**Rationale:**
- Prevents installation failures due to missing dependencies
- Reduces user cognitive load (no need to manually install prerequisites)
- Transparency about what will be installed maintains user trust
- Common pattern in package managers (npm, pip, brew)

**Alternatives considered**:
- *Manual installation only*: Poor UX, users must figure out dependencies themselves
- *Silent dependency installation*: Less transparent, users surprised by extra installations
- *No dependency support*: Limits tool coverage, many CLI tools have dependencies

## Data Models

### CLI Tool Detection Result
```typescript
interface CliToolDetection {
  templateId: string;
  installed: boolean;
  version?: string;
  executablePath?: string;
  configFiles: {
    path: string;
    exists: boolean;
    canRead: boolean;
  }[];
  detectedAt: Date;
}
```

### Environment Export
```typescript
interface EnvironmentExport {
  schemaVersion: string;
  exportedAt: string;
  hostname?: string;
  tools: CliToolDetection[];
  customTemplates: CliToolTemplate[];
}
```

## Tauri Commands

```rust
// CLI Detection
#[tauri::command]
async fn detect_cli_tools() -> Result<Vec<CliToolDetection>, String>

#[tauri::command]
async fn get_cli_config_content(path: String) -> Result<String, String>

// CLI Installation (NEW)
#[tauri::command]
async fn install_tool_brew(brew_cask_name: String) -> Result<String, String>
// Returns: Installation success/failure message
// Emits: "brew-install-progress" events with output lines

#[tauri::command]
async fn download_and_open_dmg(url: String) -> Result<String, String>
// Returns: Path to downloaded file
// Downloads to Downloads folder, then opens with Finder

// Export/Import
#[tauri::command]
async fn export_environment(data: EnvironmentExport) -> Result<String, String>

#[tauri::command]
async fn import_environment(path: String) -> Result<EnvironmentExport, String>

// Custom Tools
#[tauri::command]
async fn list_custom_templates() -> Result<Vec<CliToolTemplate>, String>

#[tauri::command]
async fn save_custom_template(template: CliToolTemplate) -> Result<(), String>

#[tauri::command]
async fn delete_custom_template(id: String) -> Result<(), String>

// Dependencies (NEW)
#[tauri::command]
async fn resolve_installation_order(tool_ids: Vec<String>) -> Result<Vec<String>, String>
// Returns: Ordered list of tool IDs for installation (dependencies first)
// Performs topological sort and validates no circular dependencies

#[tauri::command]
async fn get_dependency_tree(tool_id: String) -> Result<DependencyTree, String>
// Returns: Tree structure showing all dependencies for a tool
```

## Risks / Trade-offs

### Risk: macOS-Only Scope
**Risk**: Initial implementation only supports macOS (brew + DMG), limiting user base.

**Mitigation**:
- Design installation abstraction to support future platforms
- Document extension points for Linux (apt, dnf, yay) and Windows (winget, choco)
- Prioritize based on user feedback after initial release

### Risk: Homebrew Installation Permissions
**Risk**: Executing brew commands requires proper permissions and may fail in some environments.

**Mitigation**:
- Check for brew availability before attempting installation
- Provide clear error messages if brew is not installed
- Offer alternative installation method (DMG) if brew fails
- Show real-time output so users understand what's happening

### Risk: Brew Output Streaming Complexity
**Risk**: Streaming real-time command output from Rust to React requires event handling and state management.

**Mitigation**:
- Use Tauri's event system for progress updates
- Buffer output lines to avoid excessive React re-renders
- Provide simple "terminal-like" component for display
- Handle process termination and timeouts gracefully

### Risk: DMG Download Failures
**Risk**: Downloads may fail due to network issues, invalid URLs, or insufficient permissions.

**Mitigation**:
- Validate URLs before starting download
- Show download progress with file size
- Handle network errors with clear messages
- Save to Downloads folder which always has write access

### Risk: PATH Detection Complexity
**Risk**: PATH environment variable and executable detection varies across macOS versions.

**Mitigation**:
- Use `which` command for PATH lookup
- Fallback to checking common installation directories
- Comprehensive testing on different macOS versions

### Trade-off: Extensibility vs Simplicity
**Decision**: Template-based system balances extensibility with simplicity.

**Trade-off**: More complex than hardcoded tools, but simpler than full plugin system.

### Risk: Config File Path Resolution
**Risk**: User config files may be in non-standard locations or use environment variables.

**Mitigation**:
- Support common shell variable expansion (~, $HOME)
- Allow manual path override in UI
- Document expected locations per tool

### Risk: Version Parsing Fragility
**Risk**: Different tools have wildly different version output formats.

**Mitigation**:
- Provide flexible parsing options (stdout, stderr, regex)
- Store raw output alongside parsed version
- Allow manual version override in UI

### Risk: Circular Dependencies
**Risk**: Users may accidentally create circular dependencies in custom tools, causing infinite loops during resolution.

**Mitigation**:
- Validate dependencies on template save using cycle detection
- Show clear error message indicating which tools form the cycle
- Prevent saving templates with circular dependencies
- Provide visual feedback in dependency tree viewer

### Risk: Missing Dependencies During Import
**Risk**: Imported environment may reference tools or dependencies not available in current system.

**Mitigation**:
- Show warning during import preview for unavailable tools
- Allow user to skip unavailable tools during import
- Document which tools are missing after import
- Suggest alternative tools where applicable

## Migration Plan

### Phase 1: Initial Implementation
- Implement sidebar navigation
- Add CLI detection for built-in tools (node, python, uv, n)
- Declare dependencies for built-in tools (uv depends on python3, n depends on node)
- Homebrew installation for supported tools
- DMG download and open for supported tools
- Real-time brew output streaming
- Basic export/import JSON functionality
- Dependency resolution for installation ordering

### Phase 2: Custom Tools
- Template system for custom CLI tools
- UI for adding/editing custom templates with installation methods
- UI for declaring dependencies in custom tools
- Dependency validation (circular dependency detection)
- Persist custom tools to user config

### Phase 3: Enhancement
- Config file content viewing and editing
- Visual dependency graph/tree viewer
- Bulk operations (refresh all, export all, install all missing)
- Search/filter tools list
- Installation history and rollback
- Dependency impact analysis (show what depends on a tool before uninstalling)

### Rollback
- All new code is additive; no existing functionality to break
- Can disable features by removing sidebar items

## Open Questions

1. **Should we auto-refresh detection on app start or require manual trigger?**
   - **Proposal**: Auto-detect on start, cache for session, manual refresh button available

2. **How should we handle tools with multiple installed versions?**
   - **Proposal**: For MVP, detect primary version in PATH; add version management as future feature

3. **Should config file content be included in export or just paths?**
   - **Proposal**: Export paths and metadata only; config content viewed on-demand via file read command

4. **Should we allow concurrent installations or one at a time?**
   - **Proposal**: One at a time to avoid conflicts and complexity; show queue if user clicks multiple install buttons

5. **Should we auto-refresh detection after installation completes?**
   - **Proposal**: Yes, automatically re-run detection after successful installation to update UI

6. **How should we handle optional vs required dependencies?**
   - **Proposal**: For MVP, all dependencies are required. Future enhancement could support optional dependencies with feature flags.

7. **Should we show transitive dependencies (dependencies of dependencies)?**
   - **Proposal**: Yes, show the full dependency tree so users understand all tools that will be installed.
