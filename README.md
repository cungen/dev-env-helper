# dev-env-helper

A desktop application for managing development environments across machines. Dev-env-helper helps developers maintain portable, reproducible development environments by providing tools for CLI management, environment configuration export/import, and cross-machine setup automation.

## Features

- **CLI Tool Management**: Auto-detection and one-click installation of CLI tools via Homebrew, DMG, or website installs
- **Dependency Management**: Automatic dependency resolution with visual dependency graphs
- **Software Recommendations**: Discover and install recommended development software with category filtering
- **Environment Export/Import**: Export your development environment to JSON and restore on any machine
- **Custom Tool Templates**: Extend support to any CLI tool through a template-based system

## Tech Stack

- **Frontend**: React 19.1.0 + TypeScript 5.8.3
- **Build Tool**: Vite 7.0.4
- **Desktop Framework**: Tauri 2.x (Rust backend)
- **Styling**: Tailwind CSS 4.1.18 + shadcn/ui (New York style)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js and pnpm
- Rust (for Tauri development)
- macOS (initial support, Linux/Windows planned)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm tauri dev
```

### Building

```bash
# Build for production
pnpm tauri build
```

## Project Structure

- `src/features/` - Feature-based modules (CLI management, installation, dependencies, export/import)
- `src/components/ui/` - Reusable UI components (shadcn/ui)
- `src/hooks/` - Custom React hooks
- `src/shared/` - Shared types and utilities
- `src-tauri/src/` - Rust backend modules (CLI detection, installation, dependencies)

## Development

The project uses OpenSpec for managing changes. See `openspec/changes/` for in-progress features and proposals.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
