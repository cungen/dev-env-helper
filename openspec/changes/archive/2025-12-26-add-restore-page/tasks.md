## 1. Feature Module Structure

- [x] 1.1 Create restore page feature directory structure
  - Create `src/features/restore-page/` directory
  - Create subdirectories: `components/`, `hooks/`, `types/`
  - Follow existing feature module patterns

- [x] 1.2 Create restore page types
  - `src/features/restore-page/types/restore.ts`
  - Define `RestoreState` interface for imported environment data (tools and software)
  - Define `RestoreItem` interface that can represent either a tool or software
  - Define `RestoreTool` interface extending tool detection with restore-specific fields
  - Define `RestoreSoftware` interface extending software recommendation with restore-specific fields
  - Export types for use in components

## 2. Restore Page Component

- [x] 2.1 Create restore page main component
  - `src/features/restore-page/components/RestorePage.tsx`
  - Implement grid layout using Tailwind CSS Grid
  - Responsive breakpoints: 2 columns (mobile), 3 columns (tablet), 4 columns (desktop)
  - Display both tools and software in the same grid
  - Handle empty state (no restore data)
  - Support filtering or grouping by type (tools vs. software) if needed
  - Add selection state management (track selected items)
  - Add "Install Selected (N)" button that appears when items are selected
  - Handle batch installation workflow

- [x] 2.2 Create restore item card component
  - `src/features/restore-page/components/RestoreItemCard.tsx`
  - Support both tools and software items
  - Display item icon (tool icon, software emoji, or placeholder)
  - Display item name
  - Display item type indicator (CLI Tool or Software)
  - Display export date from backup
  - Show installation status indicator
  - Include selection checkbox (disabled if already installed)
  - Include install button (disabled if already installed)
  - Support selection state (checked/unchecked)
  - Style similar to App Store app cards
  - Handle different installation flows for tools vs. software
  - Visual highlight when selected

- [x] 2.3 Create empty state component
  - `src/features/restore-page/components/RestoreEmptyState.tsx`
  - Display message when no restore data available
  - Include button/link to import environment file
  - Provide helpful explanation

## 3. Restore State Management

- [x] 3.1 Create restore state hook
  - `src/features/restore-page/hooks/useRestoreState.ts`
  - Manage restore data in React state
  - Persist to localStorage with expiration (24 hours)
  - Provide functions to set, get, and clear restore data
  - Handle localStorage errors gracefully

- [x] 3.2 Create restore context (if needed)
  - `src/features/restore-page/context/RestoreContext.tsx`
  - Share restore state across components if needed
  - Provide restore data and update functions
  - Only create if state needs to be shared beyond restore page

## 4. Navigation Integration

- [x] 4.1 Add restore page to navigation
  - Update `src/App.tsx` to include restore page in `featureTabs` array
  - Add appropriate icon (e.g., "Download", "Package", "Archive")
  - Set label to "Restore"
  - Import and register `RestorePage` component

- [x] 4.2 Add programmatic navigation support
  - Update `src/hooks/useNavigation.ts` to expose navigation function
  - Or create navigation utility function
  - Allow components to programmatically switch tabs
  - Test navigation from import flow

## 5. Export Flow Integration (Include Software)

- [x] 5.1 Update environment export types
  - Update `src/shared/types/environment-export.ts` to include `software?: SoftwareRecommendation[]` field
  - Update `src-tauri/src/types.rs` `EnvironmentExport` struct to include `software: Vec<SoftwareRecommendation>` field
  - Make software field optional for backward compatibility

- [x] 5.2 Update environment export functionality
  - Modify export command in `src-tauri/src/lib.rs` to detect and include installed software
  - Use `detect_installed_software` function to get installed software list
  - Filter to only include software that is installed
  - Include software metadata (id, name, description, category, emoji, install methods)
  - Update frontend export hook to include software data

- [x] 5.3 Update schema validation
  - Update `src/features/environment-export/utils/schema-validation.ts`
  - Add validation for software field (optional, must be array if present)
  - Validate software items structure
  - Handle backward compatibility (software field optional)

- [x] 5.4 Test export with software
  - Test exporting environment with installed software
  - Test exporting environment without software (backward compatibility)
  - Verify exported JSON includes software data
  - Verify exported JSON structure is valid

## 6. Import Flow Integration

- [x] 6.1 Update environment import hook
  - Modify `src/features/environment-export/hooks/useEnvironmentImport.ts`
  - After successful import confirmation, store restore data (tools and software)
  - Trigger navigation to restore page
  - Handle import errors (don't navigate on error)
  - **IMPORTANT**: Do NOT trigger any automatic installation—only load and display data

- [x] 6.2 Update environment import components
  - Update `src/features/environment-export/components/EnvironmentPage.tsx`
  - Update `src/features/settings/components/EnvironmentBackupSection.tsx`
  - After successful import, navigate to restore page
  - Store imported environment data (tools and software) in restore state

- [x] 6.3 Test import flow navigation
  - Test import from environment export page
  - Test import from settings page
  - Test import with software data
  - Test import without software data (backward compatibility)
  - Verify navigation occurs after successful import
  - Verify no navigation on import failure

## 7. Tool and Software Installation Integration

- [x] 7.1 Integrate installation hooks for tools
  - Import `useToolInstallation` hook which supports batch installation
  - Import `useDependencyAwareInstall` for dependency resolution
  - Import installation context if needed
  - Wire up install button in `RestoreItemCard` for single tool installation
  - Wire up batch installation for selected tools

- [x] 7.2 Integrate installation hooks for software
  - Import software installation hooks (from software-recommendations feature)
  - Wire up install button in `RestoreItemCard` for single software installation
  - Wire up batch installation for selected software
  - Support both Homebrew cask and GitHub release installation methods

- [x] 7.3 Implement selection state management
  - Create selection state hook or use component state
  - Track selected tool IDs and software IDs
  - Handle checkbox selection/deselection
  - Update selection count for "Install Selected" button
  - Clear selection after batch installation completes

- [x] 7.4 Implement batch installation logic
  - Resolve dependencies for all selected tools
  - Create installation queue (dependencies first, then tools, then software)
  - Show preview/confirmation dialog with all items to be installed
  - Use `useToolInstallation.installTools()` for batch tool installation
  - Handle software batch installation
  - Show progress for each item in batch
  - Update cards as each item completes

- [x] 7.5 Handle installation status detection
  - Use `useCliDetection` hook to check if tools are installed
  - Use `useSoftwareInstallationStatus` hook to check if software is installed
  - Update item cards to show installed status for both tools and software
  - Refresh detection after installation completes
  - Disable selection checkboxes for installed items

- [x] 7.6 Test single item installation from restore page
  - Test installing a tool via Homebrew
  - Test installing a tool via DMG download
  - Test installing tool with dependencies
  - Test installing software via Homebrew cask
  - Test installing software via GitHub release download
  - Verify installation status updates after completion

- [x] 7.7 Test batch installation from restore page
  - Test selecting multiple tools
  - Test selecting multiple software
  - Test selecting mix of tools and software
  - Test batch installation with dependencies
  - Test batch installation confirmation dialog
  - Test installation progress for each item
  - Test canceling batch installation
  - Verify all selected items install correctly

## 8. Visual Design and Styling

- [x] 8.1 Style restore page grid layout
  - Implement responsive grid with Tailwind CSS
  - 2 columns on mobile (< 640px)
  - 3 columns on tablet (640px - 1024px)
  - 4 columns on desktop (> 1024px)
  - Add appropriate spacing and padding

- [x] 8.2 Style item cards (tools and software)
  - Match App Store card aesthetics
  - Add hover effects
  - Style installed vs. available states
  - Style selected state (highlight or border when checkbox is checked)
  - Add icons and badges appropriately
  - Ensure dark mode compatibility
  - Style both tool and software cards consistently
  - Style selection checkboxes appropriately

- [x] 8.4 Style batch installation UI
  - Style "Install Selected (N)" button
  - Position button prominently (e.g., fixed at top or bottom of page)
  - Show selection count clearly
  - Style confirmation/preview dialog for batch installation
  - Ensure button is visible when items are selected

- [x] 8.3 Style empty state
  - Center content vertically and horizontally
  - Use appropriate typography
  - Style import button/link
  - Match overall app design language

## 9. Testing and Validation

- [x] 9.1 Test restore page display
  - Test grid layout at different screen sizes
  - Test item card rendering with various tool and software data
  - Test empty state display
  - Test with many tools and software (50+ items)
  - Test mixed display of tools and software in same grid

- [x] 9.2 Test restore data persistence
  - Import environment file
  - Navigate away from restore page
  - Navigate back to restore page
  - Verify data persists
  - Test localStorage expiration

- [x] 9.3 Test navigation flow
  - Test automatic navigation after import
  - Test manual navigation to restore page
  - Test keyboard shortcuts (Cmd/Ctrl + number)
  - Test sidebar collapse/expand with restore page

- [x] 9.4 Test tool and software installation
  - Test installing individual tools
  - Test installing individual software
  - Test installing tools with dependencies
  - Test installing already-installed tools (should be disabled)
  - Test installing already-installed software (should be disabled)
  - Verify installation status updates for both tools and software

- [x] 9.6 Test multiple selection and batch installation
  - Test selecting multiple tools
  - Test selecting multiple software
  - Test selecting mix of tools and software
  - Test "Install Selected" button appears when items are selected
  - Test selection count is accurate
  - Test batch installation confirmation dialog
  - Test batch installation with dependencies
  - Test installation progress for each item in batch
  - Test canceling selection
  - Test that installed items cannot be selected
  - Verify all selected items install correctly

- [x] 9.5 Test error handling
  - Test import failure (should not navigate)
  - Test invalid restore data handling
  - Test localStorage errors
  - Test installation failures

## 10. Documentation and Cleanup

- [x] 10.1 Update code comments
  - Add JSDoc comments to new functions
  - Document restore state structure
  - Document navigation integration

- [x] 10.2 Verify TypeScript types
  - Ensure all types are properly defined
  - Fix any TypeScript errors
  - Run `tsc --noEmit` to verify

- [x] 10.3 Test build process
  - Run `pnpm build` to ensure build succeeds
  - Verify no build warnings or errors
  - Test Tauri build if applicable

