# Change: Add Restore Page

## Why
When users import an environment backup file, they need a clear visual overview of both CLI tools and installed software available in the backup. Currently, the import flow shows a preview dialog, but users would benefit from a dedicated page that displays imported tools and software in an App Store-like grid layout. This allows users to review what's available, see which tools and software are already installed on their system, and selectively install only the items they want—rather than automatically installing everything.

## What Changes
- **ADDED**: New "Restore" navigation tab/page that displays imported environment tools and software
- **ADDED**: Grid layout similar to App Store's "My Apps" section showing tools and software with icons, names, dates, and install buttons
- **MODIFIED**: Environment export to include user-installed software in addition to CLI tools
- **MODIFIED**: Environment import flow to navigate to the restore page after successful file upload (does NOT auto-install tools or software)
- **ADDED**: Ability for users to manually install individual tools and software from the restore page
- **ADDED**: Multiple selection capability allowing users to select multiple tools and software for batch installation
- **ADDED**: Batch installation functionality to install multiple selected items at once
- **ADDED**: Visual indicators showing which tools and software are already installed vs. available for installation
- **ADDED**: Selection UI with checkboxes or selection mode to choose multiple items
- **ADDED**: Support for displaying both CLI tools and software applications in the same grid layout
- **CLARIFIED**: Import process only loads and displays data; no automatic installation occurs

## Impact
- **Affected specs**:
  - `restore-page` (new capability)
  - `ui-navigation` (adds new navigation tab)
  - `environment-export` (modifies export to include software, import flow to navigate to restore page)
- **Affected code**:
  - New feature module: `src/features/restore-page/`
  - Navigation registration in `src/App.tsx`
  - Export functionality: `src/features/environment-export/` and `src-tauri/src/lib.rs` (export_environment command)
  - Import flow in `src/features/environment-export/` and `src/features/settings/`
  - Type definitions: `src/shared/types/environment-export.ts` and `src-tauri/src/types.rs`
  - Navigation hook to support programmatic navigation

