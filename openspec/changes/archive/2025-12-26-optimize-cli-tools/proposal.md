# Change: Optimize CLI Tools

## Why
The CLI tools management experience has several performance and UX issues:
1. Detection is slow even with <20 items, blocking the UI
2. CLI tool cards are cluttered with too much information
3. No visual feedback during installation, making it unclear if errors occur
4. Missing categorization like software recommendations, making it harder to browse tools

## What Changes
- **Performance**: Optimize CLI detection to run in parallel and cache results where possible
- **UI Simplification**: Simplify CLI tool cards to show only essential info (name, emoji, status, version) with details in a dialog, and change layout from list to responsive grid to show more items per screen
- **Tool Details**: Display detection method (e.g., "detected by which node") and installation methods with specific commands (e.g., "brew install node", "brew install --cask <name>") in the tool detail dialog
- **Categories**: Add category support for CLI tools similar to software recommendations, with shared component architecture
- **Installation Feedback**: Add real-time progress logs and error feedback during CLI tool installation

## Impact
- Affected specs: `cli-management`, `cli-installation`
- Affected code:
  - `src-tauri/src/cli/detection.rs` - Parallel detection optimization
  - `src/features/cli-management/components/CliToolCard.tsx` - Simplified card design
  - `src/features/cli-management/components/CliToolsPage.tsx` - Category filtering
  - `src/features/cli-installation/hooks/useToolInstallation.ts` - Progress logging
  - New shared component for category filtering (similar to software recommendations)
  - CLI tool templates extended with category and emoji fields

