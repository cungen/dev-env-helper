## 1. Layout Separation

- [x] 1.1 Update RestorePage component to separate items
  - Split restoreItems into installedItems and notInstalledItems arrays
  - Filter items based on installation status
  - Maintain existing functionality for item processing

- [x] 1.2 Add section headers
  - Add "Installed" section header above installed items
  - Add "Available for Installation" section header above not-installed items
  - Style headers consistently with app design
  - Add item count badges to headers (e.g., "Installed (5)")

## 2. Installed Items Display

- [x] 2.1 Create minimal display for installed items
  - Update RestoreItemCard to support minimal display mode
  - Show only: icon, name, installed badge
  - Hide: install button, selection checkbox, type badge, date, description
  - Use compact card styling (reduced padding, smaller height)

- [x] 2.2 Update grid layout for installed items
  - Use more compact grid (more columns, smaller cards)
  - Ensure responsive breakpoints work correctly
  - Test with various numbers of installed items

## 3. Not-Installed Items Display

- [x] 3.1 Maintain full display for not-installed items
  - Keep all current information displayed
  - Ensure install button and checkbox work correctly
  - Maintain selection and batch installation functionality

- [x] 3.2 Update grid layout for not-installed items
  - Keep current grid layout (2-4 columns based on screen size)
  - Ensure proper spacing and visual hierarchy
  - Make this section the primary focus

## 4. Visual Separation

- [x] 4.1 Add visual dividers or spacing
  - Add clear separation between sections
  - Use dividers, spacing, or background color differences
  - Ensure sections are visually distinct

- [x] 4.2 Style section headers
  - Make headers prominent but not overwhelming
  - Use appropriate typography and spacing
  - Ensure dark mode compatibility

## 5. Optional: Collapsible Installed Section

- [x] 5.1 Add collapse/expand functionality
  - Add toggle button to installed section header
  - Implement state management for collapsed state
  - Add smooth expand/collapse animation

- [x] 5.2 Persist collapse state (optional)
  - Store collapse state in localStorage
  - Restore state on page load
  - Consider default state (collapsed or expanded)

## 6. Testing and Validation

- [ ] 6.1 Test with various item combinations
  - Test with all items installed
  - Test with no items installed
  - Test with mix of installed and not-installed
  - Test with many items in each section

- [ ] 6.2 Test responsive layout
  - Test on mobile (< 640px)
  - Test on tablet (640px - 1024px)
  - Test on desktop (> 1024px)
  - Ensure both sections work well at all sizes

- [ ] 6.3 Test functionality
  - Verify selection still works for not-installed items
  - Verify batch installation still works
  - Verify individual installation still works
  - Verify installed items cannot be selected

- [ ] 6.4 Test edge cases
  - Test with empty installed section
  - Test with empty not-installed section
  - Test navigation away and back
  - Test after installing items (items should move to installed section)

## 7. Title Bar and Actions

- [x] 7.1 Add title bar to RestorePage
  - Display title bar only when restore data exists
  - Show "Restore Environment" as the page title
  - Position title bar at the top of the page content
  - Style consistently with other pages (e.g., CliToolsPage)

- [x] 7.2 Add Reset action button
  - Add "Reset" button to the right side of title bar
  - Implement reset handler that calls clearRestoreData
  - Show confirmation dialog before clearing data (optional, or direct clear)
  - Navigate to empty state after reset
  - Hide title bar after reset

- [x] 7.3 Add Re-upload action button
  - Add "Re-upload" button to the right side of title bar
  - Implement file picker that accepts JSON files
  - Reuse existing import flow from RestoreEmptyState
  - Replace existing restore data with new data
  - Update page display with new imported items
  - Show loading state during import

- [x] 7.4 Test title bar functionality
  - Test title bar appears when restore data exists
  - Test title bar hidden when no restore data
  - Test Reset button clears data and shows empty state
  - Test Re-upload button replaces existing data
  - Test both buttons work correctly together

## 8. Code Cleanup

- [x] 8.1 Update component documentation
  - Add JSDoc comments for new props/modes
  - Document minimal display mode
  - Update component usage examples

- [x] 8.2 Verify TypeScript types
  - Ensure all types are properly defined
  - Fix any TypeScript errors
  - Run `tsc --noEmit` to verify

- [x] 8.3 Test build process
  - Run `pnpm build` to ensure build succeeds
  - Verify no build warnings or errors
  - Test Tauri build if applicable

