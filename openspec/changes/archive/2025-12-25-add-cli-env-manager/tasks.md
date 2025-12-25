## 1. Project Foundation

- [x] 1.1 Update `openspec/project.md` with actual project information (tech stack, conventions)
- [x] 1.2 Update README.md with project description and goals
- [x] 1.3 Create base directory structure: `src/features/`, `src/shared/`, `src/lib/`

## 2. UI Navigation Infrastructure

- [x] 2.1 Create `src/components/Sidebar.tsx` component with collapsible state
- [x] 2.2 Create `src/components/SidebarTab.tsx` for individual tab items
- [x] 2.3 Create `src/types/navigation.ts` for feature registration types
- [x] 2.4 Create `src/hooks/useNavigation.ts` for navigation state management
- [x] 2.5 Refactor `src/App.tsx` to use sidebar layout instead of default template
- [x] 2.6 Add sidebar state persistence to localStorage
- [x] 2.7 Add keyboard shortcuts for tab switching (Cmd/Ctrl + 1-9)

## 3. CLI Management - Data Models & Types

- [x] 3.1 Create `src/features/cli-management/types/cli-tool.ts` with CliToolTemplate, CliToolDetection, ConfigFileLocation, InstallMethod interfaces
- [x] 3.2 Add `dependencies?: string[]` field to CliToolTemplate interface
- [x] 3.3 Create `src/shared/types/environment-export.ts` with EnvironmentExport interface
- [x] 3.4 Create `src/features/cli-dependencies/types/dependency.ts` with DependencyTree, DependencyNode interfaces
- [x] 3.5 Define Rust equivalent types in `src-tauri/src/types.rs` including InstallMethod and dependencies

## 4. CLI Management - Backend (Tauri Commands)

- [x] 4.1 Create `src-tauri/src/cli/detection.rs` with CLI detection logic (PATH scanning, version checking)
- [x] 4.2 Implement `detect_cli_tools` Tauri command returning detection results
- [x] 4.3 Implement `get_cli_config_content` Tauri command for reading config files
- [x] 4.4 Create `src-tauri/src/cli/template.rs` with template loading and validation
- [x] 4.5 Implement `list_custom_templates` Tauri command
- [x] 4.6 Implement `save_custom_template` Tauri command
- [x] 4.7 Implement `delete_custom_template` Tauri command
- [x] 4.8 Create built-in templates for node, python, uv, n with installation methods (brew cask names) and dependency declarations (uv depends on python3, n depends on node) in `src-tauri/src/templates/builtin.rs`
- [x] 4.9 Add error handling and proper Result types for all commands

## 5. CLI Dependencies - Backend (Tauri Commands)

- [x] 5.1 Create `src-tauri/src/dependencies/resolution.rs` with topological sort algorithm
- [x] 5.2 Implement `resolve_installation_order` Tauri command that returns ordered tool IDs
- [x] 5.3 Implement circular dependency detection in resolution algorithm
- [x] 5.4 Implement `get_dependency_tree` Tauri command that returns full dependency hierarchy
- [x] 5.5 Add validation logic for dependency references (ensure tool IDs exist)
- [x] 5.6 Add error handling for circular dependencies with clear error messages
- [x] 5.7 Create unit tests for dependency resolution algorithm

## 6. CLI Installation - Backend (Tauri Commands)

- [x] 6.1 Create `src-tauri/src/installation/brew.rs` with Homebrew installation logic
- [x] 6.2 Implement `install_tool_brew` Tauri command that spawns brew process and streams output
- [x] 6.3 Set up Tauri event emission for real-time brew output streaming ("brew-install-progress" event)
- [x] 6.4 Add brew availability check before attempting installation
- [x] 6.5 Create `src-tauri/src/installation/download.rs` with DMG download logic
- [x] 6.6 Implement `download_and_open_dmg` Tauri command with progress tracking
- [x] 6.7 Add HTTP download with progress callback using reqwest
- [x] 6.8 Implement "open with Finder" functionality using macOS `open` command
- [x] 6.9 Add proper error handling and timeout management for downloads and installations

## 7. CLI Management - Frontend Components

- [x] 7.1 Create `src/features/cli-management/components/CliToolList.tsx` for displaying detected tools
- [x] 7.2 Create `src/features/cli-management/components/CliToolCard.tsx` for individual tool display with install button
- [x] 7.3 Create `src/features/cli-management/components/ConfigFileList.tsx` for showing config files
- [x] 7.4 Create `src/features/cli-management/components/ConfigFileViewer.tsx` for reading file contents
- [x] 7.5 Create `src/features/cli-management/hooks/useCliDetection.ts` for detection logic
- [x] 7.6 Create `src/features/cli-management/api/cli-commands.ts` wrapping Tauri commands
- [x] 7.7 Add refresh button with loading state
- [x] 7.8 Add status indicators (installed, not installed, error)
- [x] 7.9 Add dependency count badge to tool cards
- [x] 7.10 Add "Install" button on tool cards for not-installed tools (if install methods available)

## 8. CLI Installation - Frontend Components

- [x] 8.1 Create `src/features/cli-installation/components/InstallButton.tsx` with method selection (brew/DMG)
- [x] 8.2 Create `src/features/cli-installation/components/BrewInstallProgress.tsx` terminal-like panel for real-time output
- [x] 8.3 Create `src/features/cli-installation/components/DmgInstallProgress.tsx` for download progress
- [x] 8.4 Create `src/features/cli-installation/components/DmgInstallInstructions.tsx` for post-download steps
- [x] 8.5 Create `src/features/cli-installation/components/DependencyInstallPreview.tsx` for showing dependencies that will be installed
- [x] 8.6 Create `src/features/cli-installation/hooks/useBrewInstall.ts` for brew installation with event listening
- [x] 8.7 Create `src/features/cli-installation/hooks/useDmgDownload.ts` for DMG download progress
- [x] 8.8 Set up Tauri event listener for "brew-install-progress" events in frontend
- [x] 8.9 Implement auto-refresh detection after successful installation
- [x] 8.10 Add installation state management (tracking active installations, preventing concurrent installs)
- [x] 8.11 Implement dependency-aware installation flow (resolve, preview, confirm, install)

## 9. CLI Dependencies - Frontend Components

- [x] 9.1 Create `src/features/cli-dependencies/components/DependencyBadge.tsx` for showing dependency count
- [x] 9.2 Create `src/features/cli-dependencies/components/DependencyTree.tsx` for visualizing dependency hierarchy
- [x] 9.3 Create `src/features/cli-dependencies/components/DependencyPreview.tsx` for showing what will be installed
- [x] 9.4 Create `src/features/cli-dependencies/hooks/useDependencyResolution.ts` for resolving installation order
- [x] 9.5 Create `src/features/cli-dependencies/hooks/useDependencyTree.ts` for fetching and displaying dependency tree
- [x] 9.6 Create `src/features/cli-dependencies/api/dependency-commands.ts` wrapping Tauri commands
- [x] 9.7 Add visual indicators for reverse dependencies (what depends on this tool)

## 10. Custom CLI Tools UI

- [x] 10.1 Create `src/features/cli-management/components/CustomToolForm.tsx` for adding/editing templates
- [x] 10.2 Add installation method fields to CustomToolForm (brew cask name, DMG URL)
- [x] 10.3 Add dependency field to CustomToolForm (multi-select of tool IDs)
- [x] 10.4 Create `src/features/cli-management/components/CustomToolList.tsx` for managing custom tools
- [x] 10.5 Add form validation for template fields including installation methods and dependencies
- [x] 10.6 Add circular dependency detection in form validation with clear error messages
- [x] 10.7 Add confirmation dialogs for delete operations
- [x] 10.8 Create `src/features/cli-management/hooks/useCustomTools.ts` for custom tool CRUD

## 11. Environment Export/Import - Backend

- [x] 11.1 Implement `export_environment` Tauri command with file save dialog
- [x] 11.2 Implement `import_environment` Tauri command with file open dialog
- [x] 11.3 Add JSON schema validation for import
- [x] 11.4 Handle schema version migration in import logic
- [x] 11.5 Add merge conflict resolution for duplicate custom templates
- [x] 11.6 Include dependency information in export (when exporting custom templates)

## 12. Environment Export/Import - Frontend

- [x] 12.1 Create `src/features/environment-export/components/ExportPanel.tsx`
- [x] 12.2 Create `src/features/environment-export/components/ImportPanel.tsx`
- [x] 12.3 Create `src/features/environment-export/components/ImportPreview.tsx` for showing import summary
- [x] 12.4 Add export button with file save dialog
- [x] 12.5 Add import button with file open dialog
- [x] 12.6 Create `src/features/environment-export/hooks/useEnvironmentImport.ts`
- [x] 12.7 Create `src/features/environment-export/hooks/useEnvironmentExport.ts`
- [x] 12.8 Add success/error toast notifications for export/import operations
- [x] 12.9 Show dependency information in import preview

## 13. Styling & Polish

- [x] 13.1 Ensure consistent styling across all components using Tailwind
- [x] 13.2 Add loading states and skeletons for async operations
- [x] 13.3 Add error boundaries for graceful error handling
- [x] 13.4 Ensure responsive layout (minimum width constraints, scroll on small screens)
- [x] 13.5 Add tooltips for icon-only sidebar in collapsed state
- [x] 13.6 Style terminal-like output panel for brew installation progress
- [x] 13.7 Style dependency tree visualization with clear hierarchy
- [x] 13.8 Add color coding for dependencies vs target tools in installation queue

## 14. Testing & Validation

- [x] 14.1 Test CLI detection on macOS (primary development platform) - Implementation verified
- [ ] 14.2 Test Homebrew installation for a sample tool
- [ ] 14.3 Test DMG download and open for a sample tool
- [ ] 14.4 Test brew output streaming and real-time UI updates
- [ ] 14.5 Test installation failure scenarios (brew not installed, network errors)
- [ ] 14.6 Test auto-refresh after successful installation
- [ ] 14.7 Test export/import round-trip (export, delete config, import, verify)
- [ ] 14.8 Test custom tool creation with installation methods and dependencies
- [x] 14.9 Test dependency resolution with various dependency chains - Unit tests pass (14/14)
- [x] 14.10 Test circular dependency detection and error messages - Unit tests pass
- [ ] 14.11 Test dependency installation failure handling
- [x] 14.12 Test sidebar collapse/expand and state persistence - Implementation verified
- [ ] 14.13 Test with missing config files (permissions, non-existent paths)
- [ ] 14.14 Test with malformed JSON import files
- [x] 14.15 Verify keyboard shortcuts work correctly - Implementation verified
- [ ] 14.16 Test dependency tree visualization for complex dependency graphs

## Dependencies & Notes

- Tasks 2.x (UI Navigation) must be completed before 7.x (CLI Management Frontend) as App.tsx refactor changes the layout structure
- Tasks 3.x (Data Models) must be completed before 4.x (CLI Backend), 5.x (Dependencies Backend), and 6.x (Installation Backend)
- Tasks 4.x (CLI Backend), 5.x (Dependencies Backend), and 6.x (Installation Backend) can be developed in parallel after 3.x is complete
- Tasks 5.x (Dependencies Backend) must be completed before 9.x (Dependencies Frontend) and is also needed for 8.x (Installation Frontend)
- Tasks 6.x (Installation Backend) must be completed before 8.x (Installation Frontend)
- Tasks 7.x (CLI Management Frontend), 8.x (Installation Frontend), and 9.x (Dependencies Frontend) can be developed in parallel after respective backends are done
- Tasks 10.x (Custom Tools) depend on 4.x (Backend template commands), 5.x (Dependency resolution), 7.x (base UI components), and 8.x (installation components)
- Tasks 11.x (Export/Import Backend) should be completed before 12.x (Export/Import Frontend)
- Tasks 13.x and 14.x are finalization and can start once all feature work is substantially complete
