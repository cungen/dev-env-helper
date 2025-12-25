# Project Context

## Purpose
A desktop application for managing development environments. Dev-env-helper helps developers maintain portable, reproducible development environments by providing tools for CLI management, environment configuration export/import, and cross-machine setup automation.

## Tech Stack
- **Frontend Framework**: React 19.1.0 with TypeScript 5.8.3
- **Build Tool**: Vite 7.0.4
- **Desktop Framework**: Tauri 2.x (Rust backend)
- **Styling**: Tailwind CSS 4.1.18 with custom theme configuration
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React 0.562.0
- **Notifications**: Sonner 2.0.7
- **Theme Management**: next-themes 0.4.6 (dark mode support)
- **Utilities**: clsx, tailwind-merge, class-variance-authority
- **Package Manager**: pnpm
- **Language**: TypeScript (strict mode enabled)
- **Backend**: Rust (Tauri) with serde, serde_json, chrono, dirs

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`
- **Path Aliases**: Use `@/` prefix for imports from `src/` directory (e.g., `@/components`, `@/lib/utils`)
- **Component Naming**: PascalCase for React components
- **File Naming**: kebab-case for component files (e.g., `button.tsx`)
- **Styling**: Use Tailwind CSS utility classes by default. Use `cn()` utility from `@/lib/utils` for conditional class merging
- **Component Variants**: Use `class-variance-authority` (CVA) for component variant management
- **Dark Mode**: Implemented via CSS custom properties and `.dark` class selector
- **Formatting**: Follow React and TypeScript best practices

### Architecture Patterns
- **Component Structure**:
  - Reusable UI components in `src/components/ui/` following shadcn/ui patterns
  - Utility functions in `src/lib/`
  - Main application logic in `src/App.tsx`
  - Feature-based modules in `src/features/` (e.g., `cli-management`, `cli-installation`, `cli-dependencies`, `environment-export`)
  - Shared types and utilities in `src/shared/`
  - Custom hooks in `src/hooks/`
- **Tauri Integration**:
  - Rust commands defined in `src-tauri/src/` with feature-based modules (cli, dependencies, installation)
  - Frontend invokes Rust commands via `@tauri-apps/api/core` `invoke()` function
  - Tauri event system for real-time progress updates (e.g., "brew-install-progress")
  - Tauri configuration in `src-tauri/tauri.conf.json`
  - Type definitions in `src-tauri/src/types.rs` shared between Rust modules
- **Styling Architecture**:
  - Global styles and theme configuration in `src/index.css`
  - Tailwind CSS v4 with custom theme variables using OKLCH color space
  - CSS custom properties for theming with dark mode support
  - Component-specific styles use Tailwind utility classes
  - Animations via tw-animate-css
- **Path Resolution**: Configured in `vite.config.ts` and `tsconfig.json` with `@/*` alias pointing to `src/*`
- **State Management**:
  - React hooks for local component state (useState, useEffect)
  - Custom hooks for feature-specific logic (e.g., useCliDetection, useBrewInstall, useDependencyResolution)
  - Tauri commands for backend state and operations
- **Navigation**:
  - Sidebar-based navigation with collapsible state
  - Feature registration via TypeScript types
  - Keyboard shortcuts for tab switching (Cmd/Ctrl + 1-9)
  - State persistence to localStorage

### Testing Strategy
- **Backend Unit Tests**: Rust unit tests in `src-tauri/src/` modules (e.g., dependency resolution tests)
- Run with: `cargo test` or `pnpm test`
- Integration tests for Tauri commands to be added
- Frontend testing framework to be determined

### Git Workflow
- Use OpenSpec for managing changes via `openspec/changes/` directory
- Create proposals for significant features before implementation
- Use task checklists to track implementation progress
- Mark tasks as complete only after full implementation and verification

## Domain Context
- **Application Type**: Native desktop application (Tauri), not a web app
- **Architecture**: Rust backend (Tauri) with React frontend
- **Primary Platform**: macOS (initial implementation), with Linux/Windows support planned
- **Development Server**: Port 1420 (fixed, configured in `vite.config.ts` and Tauri config)
- **UI Framework**: shadcn/ui with the "New York" style variant
- **Theme Support**: Dark mode via CSS custom properties and next-themes
- **Core Features**:
  - CLI tool detection and version tracking (Node.js, Python, uv, n, and custom tools)
  - One-click tool installation via Homebrew or DMG downloads
  - Dependency-aware installation (auto-resolves and installs dependencies)
  - Environment configuration export/import (JSON-based)
  - Visual dependency graph and installation queue
  - Template system for extending to custom CLI tools

## Important Constraints
- **Tauri-specific**:
  - Frontend must be built before Tauri can bundle the application
  - Port 1420 is fixed for development (cannot be changed without updating Tauri config)
  - `src-tauri/` directory is ignored by Vite's file watcher
  - Requires proper file system and process spawning permissions in Tauri config
- **TypeScript**: Strict mode is enforced - all code must pass strict type checking
- **Build Process**: Requires both TypeScript compilation (`tsc`) and Vite build (`vite build`)
- **Package Manager**: Project uses `pnpm` (use `pnpm install`, `pnpm dev`, `pnpm build`)
- **Platform Limitations**:
  - Initial implementation is macOS-only (Homebrew integration, DMG downloads)
  - Linux/Windows support requires additional platform-specific code
- **File System**: Requires user permissions for accessing config files and export/import operations
- **Process Spawning**: Brew installation requires spawning child processes with output streaming

## External Dependencies
- **Tauri**: Desktop application framework providing native OS integration (v2.x)
- **shadcn/ui**: Component library with Radix UI primitives (New York style)
- **Radix UI**: Headless UI primitives (AlertDialog, Dialog, DropdownMenu, Label, Progress, ScrollArea, Select, Separator, Tooltip, Slot)
- **Vite**: Development server and build tool (v7.0.4)
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration (v4.1.18)
- **PostCSS + Autoprefixer**: CSS processing pipeline
- **tw-animate-css**: Tailwind animation utilities
- **Rust Dependencies**: serde, serde_json (JSON serialization), chrono (datetime), dirs (path resolution)
