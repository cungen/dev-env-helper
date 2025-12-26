# Design: Restore Page

## Context
Users need a visual way to browse and selectively install both CLI tools and software applications from an imported environment backup. The current import flow shows a preview dialog, but doesn't provide a persistent view of imported items or the ability to selectively install them. The App Store's "My Apps" interface provides a good reference for how to display a grid of available software with clear install actions. Importantly, users should have full control over what gets installed—the import process should only load and display the data, not automatically install anything. The environment export should include both CLI tools and user-installed software to provide a complete backup of the development environment.

## Goals / Non-Goals

### Goals
- Display imported tools and software in an App Store-like grid layout
- Show tool/software icons, names, export dates, and installation status
- Allow users to manually install individual tools and software from the restore page (user-initiated only)
- Navigate to restore page automatically after successful import
- Persist imported environment data so users can return to the restore page
- Show which tools and software are already installed vs. available for installation
- Include both CLI tools and software applications in environment export
- Give users full control over what gets installed (no automatic installation)

### Non-Goals
- Automatic installation of tools during import (users must manually choose what to install)
- Batch installation of all tools (users install one at a time)
- Full App Store functionality (no app store integration, no purchase flow)
- Real-time sync with external app stores
- Multiple restore sessions simultaneously (one active restore at a time)

## Decisions

### Decision 1: Restore Page as Dedicated Navigation Tab
**What**: Add "Restore" as a permanent navigation tab in the sidebar.

**Rationale**:
- Provides persistent access to imported tools
- Follows existing navigation patterns (Home, CLI Tools, Software, Settings)
- Allows users to return to restore page after navigating away
- Makes restore functionality discoverable

**Alternatives considered**:
- Modal/dialog only: Less discoverable, disappears when closed
- Temporary page that disappears after import: Users lose access to imported tools
- Sub-page of Settings: Less prominent, harder to find

**Implementation**: Register restore page in `featureTabs` array in `src/App.tsx`.

### Decision 2: Grid Layout with App Store Aesthetics
**What**: Display tools in a responsive grid (2-4 columns depending on screen size) with cards showing icon, name, date, and install button.

**Rationale**:
- Familiar pattern from App Store
- Efficient use of screen space
- Clear visual hierarchy
- Easy to scan and identify tools

**Alternatives considered**:
- List view: Less visual, harder to scan
- Table view: Too dense, less modern
- Single column: Wastes horizontal space on larger screens

**Implementation**: Use CSS Grid with Tailwind classes, responsive breakpoints for 2-4 columns.

### Decision 3: Navigation After Import (No Auto-Installation)
**What**: After successful file upload and validation, automatically navigate to the restore page. The import process only loads and displays the data—it does NOT automatically install any tools.

**Rationale**:
- Immediate feedback that import succeeded
- Shows user what's available right away
- Gives users full control over what gets installed
- Prevents unwanted automatic installations
- Users can review and choose what to install

**Alternatives considered**:
- Auto-install all tools: Too aggressive, users lose control, might install unwanted tools
- Show preview dialog then navigate: Extra step, more clicks
- Stay on current page: User might not know where to find imported tools
- Ask user where to go: Unnecessary decision point

**Implementation**: Use navigation hook's `setActiveTab` function after successful import. Store imported data in restore state without triggering any installation processes.

### Decision 4: Restore State Management
**What**: Store imported environment data in component state and/or localStorage so it persists across navigation.

**Rationale**:
- Allows users to navigate away and return
- Preserves imported data during session
- Simple implementation using existing patterns

**Alternatives considered**:
- Global state management (Redux/Zustand): Overkill for single feature
- Backend storage: Unnecessary, restore is frontend-only operation
- Session-only (no persistence): Users lose data if they navigate away

**Implementation**: Use React state with localStorage backup, or context provider if needed across components.

### Decision 5: Manual Tool and Software Installation from Restore Page
**What**: Users can install items individually or select multiple items for batch installation. Each tool/software card shows an install button for single-item installation, and a selection checkbox for batch operations. Installation is user-initiated only—users must explicitly choose what to install.

**Rationale**:
- Gives users full control over what gets installed
- Supports both single-item and batch installation workflows
- Reuses existing installation infrastructure for both tools and software
- Consistent user experience across tool and software installation
- No need to duplicate installation logic
- Prevents accidental or unwanted installations
- Improves efficiency when installing multiple items

**Alternatives considered**:
- Auto-install all items: Too aggressive, users lose control, might install unwanted items
- Only single-item installation: Less efficient for users installing many items
- Different installation flow: Inconsistent, more code to maintain

**Implementation**:
- Reuse `useToolInstallation` hook which already supports batch installation (takes array of tools)
- Reuse software installation hooks for software
- Add selection state management (checkboxes or selection mode)
- Add "Install Selected" button that appears when items are selected
- Each card has both an install button (single) and a checkbox (for selection)

### Decision 8: Multiple Selection and Batch Installation
**What**: Users can select multiple tools and software items using checkboxes, then install all selected items at once using a batch install button.

**Rationale**:
- Improves efficiency when restoring many items
- Reduces repetitive clicking for users installing multiple tools/software
- Reuses existing batch installation infrastructure (`useToolInstallation.installTools()`)
- Maintains user control (explicit selection required)
- Common pattern in app stores and package managers

**Alternatives considered**:
- Only single-item installation: Less efficient, more clicks required
- Select all button: Too risky, might install unwanted items
- Keyboard shortcuts for selection: Good addition but not required for MVP

**Implementation**:
- Add checkbox to each restore item card
- Track selected items in component state
- Show "Install Selected (N)" button when items are selected
- Disable selection for already-installed items
- Show selection count indicator
- Batch install tools first, then software (or maintain separate queues)
- Show progress for each item in the batch
- Handle dependencies for tools (resolve before batch install)

### Decision 7: Include Software in Environment Export
**What**: Environment export should include both CLI tools and user-installed software applications.

**Rationale**:
- Provides complete backup of development environment
- Users can restore both CLI tools and software applications
- Consistent with user expectation of "backup everything"
- Software is part of the development environment

**Alternatives considered**:
- Export only CLI tools: Incomplete backup, users lose software information
- Separate export for software: More complex, requires multiple files
- Export software separately: Inconsistent with unified backup concept

**Implementation**:
- Update `EnvironmentExport` type to include `software: Vec<SoftwareRecommendation>` field
- Update export command to detect and include installed software
- Update schema validation to handle software field
- Maintain backward compatibility (software field optional for older exports)

### Decision 6: Visual Indicators for Installation Status
**What**: Show visual distinction between installed tools (checkmark, different styling) and tools available for installation (download icon).

**Rationale**:
- Clear feedback on what's already installed
- Prevents confusion about what needs to be done
- Matches App Store pattern

**Alternatives considered**:
- Text-only indicators: Less visual, harder to scan
- Separate sections: More complex layout

**Implementation**: Use badges or icon overlays on tool cards, check installation status via detection hook.

## Risks / Trade-offs

### Risk: Navigation State Management
**Mitigation**:
- Use existing navigation hook patterns
- Store restore data in localStorage with expiration
- Clear restore data when new import happens

### Risk: Performance with Many Tools
**Mitigation**:
- Grid layout is efficient for rendering
- Lazy load tool icons if needed
- Limit to reasonable number of tools (100+ should still be fine)

### Risk: Duplicate Installation Logic
**Mitigation**:
- Reuse existing installation hooks and components
- Extract shared installation logic if needed
- Test installation from both CLI Tools and Restore pages

### Risk: Restore Data Persistence
**Mitigation**:
- Use localStorage with clear expiration (e.g., 24 hours)
- Provide clear way to clear restore data
- Handle corrupted localStorage gracefully

## Migration Plan

### Initial Implementation
1. Create restore page feature module structure
2. Add restore page component with grid layout
3. Register restore page in navigation
4. Modify import flow to navigate to restore page
5. Add tool installation functionality to restore page
6. Add visual indicators for installation status
7. Add state persistence for restore data

### Testing
- Test import flow navigation
- Test grid layout responsiveness
- Test tool installation from restore page
- Test restore data persistence
- Test navigation away and back to restore page

