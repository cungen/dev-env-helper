# Change: Update Restore Page Layout - Separate Installed Items

## Why
Currently, the restore page displays all items (installed and not-installed) in a single grid with the same level of detail. This creates visual clutter and makes it harder for users to focus on items that need installation. Users primarily care about items they can install, while already-installed items are just for reference. Separating installed items into a minimal display section and keeping full details for not-installed items will improve the user experience by reducing visual noise and making actionable items more prominent.

## What Changes
- **MODIFIED**: Restore page layout to separate installed and not-installed items into distinct sections
- **MODIFIED**: Installed items display with minimal information (icon, name, version/category instead of installed badge)
- **MODIFIED**: Installed items do not show install button, selection checkbox, or detailed metadata
- **MODIFIED**: Not-installed items display with full information (icon, name, type, date, description, install button, selection checkbox)
- **ADDED**: Visual separation between installed and not-installed sections (headers, dividers, or separate grids)
- **ADDED**: Option to collapse/hide installed items section to further reduce clutter
- **ADDED**: Title bar with page title when restore data is loaded
- **ADDED**: Action buttons (Reset and Re-upload) in the title bar when restore data exists

## Impact
- **Affected specs**:
  - `restore-page` (modifies display requirements, adds title bar and actions)
- **Affected code**:
  - `src/features/restore-page/components/RestorePage.tsx` (layout changes, title bar, action buttons)
  - `src/features/restore-page/components/RestoreItemCard.tsx` (conditional rendering based on installed status)
  - `src/features/restore-page/hooks/useRestoreState.ts` (uses existing clearRestoreData function)
  - File upload functionality (reuses existing import flow)

