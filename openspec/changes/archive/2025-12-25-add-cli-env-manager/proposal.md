# Change: Add CLI Environment Manager

## Why

Developers need to manage multiple CLI tools (Node.js, Python, uv, n, etc.) across different machines. Currently there's no unified way to:
- Detect and track installed CLI tools and their versions
- Export environment configuration for backup/migration
- Restore entire development environment on a new machine
- Extend support to custom CLI tools through a templating system

This change adds the foundational feature set for dev-env-helper, enabling developers to maintain portable, reproducible development environments.

## What Changes

### New Capabilities
- **CLI Tool Management**: Auto-detection and manual configuration of CLI tools (node, python, uv, n, and custom tools)
  - Detect installation status via PATH scanning
  - Display version information
  - Manage configuration files (location, content viewing)
  - Template-based system for adding custom CLI tools
  - **One-click installation** for unsupported tools via Homebrew or DMG download (macOS)
  - **Dependency-aware installation**: Tools can specify dependencies that must be installed first
  - **Automatic dependency resolution**: System detects missing dependencies and installs them in correct order
  - **Visual dependency graph**: Users can see which tools depend on others
  - **Smart installation queue**: Dependencies are installed automatically before the target tool

- **Environment Export/Import**: JSON-based export of all configured CLI tools
  - Export tool definitions and detected versions to portable JSON
  - Import/export via file picker for cross-machine migration
  - Restore environment by importing configuration on new machine

- **Navigation Layout**: Sidebar-based tab navigation
  - Vertical sidebar for switching between tools
  - Extensible for future feature additions beyond CLI management
  - Collapsible sidebar for space efficiency

### Affected Specs
- New spec: `cli-management` - Core CLI tool detection, configuration, installation, and management
- New spec: `cli-dependencies` - Dependency resolution and installation ordering
- New spec: `environment-export` - Export/import environment configuration
- New spec: `ui-navigation` - Sidebar navigation and extensibility
- New spec: `cli-installation` - One-click CLI tool installation via Homebrew and DMG downloads

### Affected Code
- Frontend: New `src/features/cli-management/` module with components for CLI listing, detection, configuration, and installation
- Frontend: New `src/features/cli-installation/` module for installation UI and progress tracking
- Frontend: New `src/features/cli-dependencies/` module for dependency graph visualization and installation queue management
- Frontend: New `src/features/environment-export/` module for export/import UI
- Frontend: Refactor `src/App.tsx` to use sidebar navigation
- Backend (Tauri): New commands in `src-tauri/src/` for system-level CLI detection, file I/O, brew installation, and file downloads
- Backend (Tauri): Dependency resolution logic for determining installation order
- Data: JSON-based tool definitions with installation methods (brew cask name, DMG URLs) and dependency declarations

## Impact

### User-Facing
- Users can see all detected CLI tools in one place with version info
- Users can install missing CLI tools with one click (via Homebrew or DMG download)
- Users can see real-time installation progress with brew output in the app
- Users can view dependencies between tools (e.g., uv depends on Python)
- Users can install a tool and have its dependencies automatically installed first
- Users can see visual indicators showing which tools will be installed as dependencies
- Users can export their environment and restore on another machine
- Users can extend support to custom CLI tools via templates (including dependency declarations)
- Clean navigation pattern for adding future features

### Technical
- Introduces core data models (CLI tool definition, detection result, environment config, installation method, dependencies)
- Adds Tauri commands for OS-level CLI detection (PATH scanning, version checking)
- Adds Tauri commands for executing brew installations with real-time output streaming
- Adds Tauri commands for downloading DMG files and opening them
- Adds dependency resolution algorithm to determine installation order (topological sort)
- Adds visualization components for dependency graph
- Establishes modular feature structure for future additions
- Requires file system access for export/import and config file reading
- Requires process spawning permissions for brew installation
- macOS-only for initial implementation (Linux/Windows support can be added later)

### Dependencies
- Uses existing Tauri APIs for file system access and process spawning
- Uses existing React + Radix UI components
- No new external dependencies required initially
