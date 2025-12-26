# Design: Update Restore Page Layout - Separate Installed Items

## Context
The restore page currently displays all imported tools and software in a single grid, with installed items showing disabled checkboxes and install buttons. This creates visual clutter and makes it harder for users to focus on items that need installation. Users primarily need to see and act on items that are not yet installed, while installed items are mainly for reference.

## Goals / Non-Goals

### Goals
- Separate installed and not-installed items into distinct visual sections
- Show minimal information for installed items (icon, name, installed badge)
- Remove install button and selection checkbox from installed items
- Show full information for not-installed items (all current details)
- Make not-installed items the primary focus of the page
- Reduce visual clutter while maintaining clarity

### Non-Goals
- Changing the installation functionality (same as before)
- Removing installed items entirely (they should still be visible for reference)
- Changing the restore data structure or persistence
- Modifying the import flow

## Decisions

### Decision 1: Two-Section Layout
**What**: Display installed items in a separate section above or below the not-installed items section, with clear headers.

**Rationale**:
- Clear visual separation makes it obvious which items need action
- Users can quickly scan installed items for reference
- Not-installed items remain the primary focus
- Maintains all information while improving organization

**Alternatives considered**:
- Tabs: More clicks required, hides information
- Filter toggle: Still shows all items mixed together
- Separate pages: Too much navigation overhead

**Implementation**: Add section headers ("Installed" and "Available for Installation") with distinct grid layouts.

### Decision 2: Minimal Display for Installed Items
**What**: Installed items show only icon, name, and installed badge. No install button, no checkbox, no type badge, no date, no description.

**Rationale**:
- Installed items don't need action, so minimal info is sufficient
- Reduces visual clutter significantly
- Users can still identify what's installed
- Focuses attention on actionable items

**Alternatives considered**:
- Hide installed items completely: Users lose context of what's already installed
- Show all details but grayed out: Still creates clutter
- Show in a list instead of grid: Less visual, harder to scan

**Implementation**: Create a simplified card component or conditional rendering in RestoreItemCard to show minimal version for installed items.

### Decision 3: Full Display for Not-Installed Items
**What**: Not-installed items continue to show all current information: icon, name, type badge, date, description (for software), install button, selection checkbox.

**Rationale**:
- Users need full information to make installation decisions
- Maintains current functionality
- Clear what actions are available
- Consistent with current design

**Implementation**: Use existing RestoreItemCard component with full details for not-installed items.

### Decision 4: Collapsible Installed Section (Optional Enhancement)
**What**: Add ability to collapse/hide the installed items section to maximize focus on not-installed items.

**Rationale**:
- Further reduces clutter when user doesn't need to see installed items
- Gives users control over what they see
- Simple toggle implementation
- Can be collapsed by default if desired

**Alternatives considered**:
- Always show: Less flexible
- Always hide: Users lose context

**Implementation**: Add collapse/expand button to installed section header, use state to track collapsed state.

## Risks / Trade-offs

### Risk: Users might want to see installed items with more detail
**Mitigation**:
- Keep installed items visible (not hidden)
- Consider adding hover tooltip or click to expand details if needed
- Can be enhanced later based on user feedback

### Risk: Layout might feel disconnected
**Mitigation**:
- Use clear section headers
- Maintain consistent spacing and styling
- Ensure visual hierarchy is clear

### Risk: Mobile responsiveness
**Mitigation**:
- Test grid layouts on different screen sizes
- Ensure both sections work well on mobile
- Consider stacking sections vertically on small screens

### Decision 5: Title Bar with Actions
**What**: Add a title bar at the top of the restore page that displays "Restore Environment" as the title and provides "Reset" and "Re-upload" action buttons when restore data exists.

**Rationale**:
- Provides clear page context and identity
- Gives users quick access to reset or replace restore data
- Consistent with other pages (e.g., CliToolsPage) that have title bars
- Actions are contextually relevant when data is loaded
- Improves discoverability of reset/re-upload functionality

**Alternatives considered**:
- Actions in sidebar: Less discoverable, requires navigation
- Actions in empty state only: Users can't reset/re-upload when data is loaded
- Separate settings page: Too much navigation overhead for simple actions

**Implementation**: Add title bar component at top of RestorePage, conditionally render based on hasRestoreData, reuse existing clearRestoreData and file upload functionality.

## Migration Plan

### Initial Implementation
1. Update RestorePage to separate items into installed/not-installed arrays
2. Add section headers ("Installed" and "Available for Installation")
3. Create minimal card variant for installed items or conditional rendering
4. Update RestoreItemCard to support minimal display mode
5. Add title bar with "Restore Environment" title
6. Add Reset and Re-upload action buttons to title bar
7. Test layout on different screen sizes
8. Add collapse/expand functionality (optional)

### Testing
- Test with mix of installed and not-installed items
- Test with all items installed
- Test with no items installed
- Test responsive layout
- Test selection and batch installation still works correctly
- Test title bar appears/hides correctly
- Test Reset and Re-upload actions work as expected

