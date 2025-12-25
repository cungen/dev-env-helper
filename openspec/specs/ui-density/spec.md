# ui-density Specification

## Purpose
TBD - created by archiving change optimize-ui-density. Update Purpose after archive.
## Requirements
### Requirement: Horizontal Tool Card Layout
The system SHALL display CLI tool cards using a horizontal row layout that utilizes available width efficiently.

#### Scenario: Compact single-row tool display
- **WHEN** viewing the CLI Tools page
- **THEN** each tool card displays all key information in a single horizontal row
- **AND** the row contains: tool icon, name, version (when installed), template ID badge, dependency badges, status badge, and install button
- **AND** card height is approximately 50-60px (excluding expanded config files)
- **AND** cards use 12px padding (p-3)

#### Scenario: Information grouping within card
- **WHEN** viewing a tool card
- **THEN** tool identity (icon, name, version, template ID) appears on the left
- **AND** dependency badges appear in the center
- **AND** status badge and install button appear on the right
- **AND** flexible spacers push groups apart to use available width

#### Scenario: Inline metadata display
- **WHEN** viewing tool metadata
- **THEN** the tool name displays at full size (16px) with semibold weight
- **AND** version displays inline next to name when installed (e.g., "Node.js v20.10.0")
- **AND** template ID displays as a small outline badge (12px text)
- **AND** no separate "Template ID" label is used (badge is self-explanatory)

#### Scenario: Dependency badges inline
- **WHEN** a tool has dependencies
- **THEN** each dependency displays as a small secondary badge in the center area
- **AND** badges show the dependency name directly (no count with separate section)
- **AND** the Network icon and count text from the header are removed (redundant)

### Requirement: Collapsible Config Files Section
The system SHALL hide config file lists by default and allow users to expand them inline within the card.

#### Scenario: Config files collapsed by default
- **WHEN** viewing a tool card with config files
- **THEN** the config file list is hidden
- **AND** a "View Configs (N)" button appears below the main row
- **AND** N is the count of config files for that tool
- **AND** the button uses chevron icon (▶) to indicate collapsed state

#### Scenario: Expand config files inline
- **WHEN** the user clicks the "View Configs" button
- **THEN** the config file list expands below the button within the card
- **AND** the button text changes to "▼ View Configs (N)"
- **AND** the expansion animates smoothly (200ms transition)
- **AND** the card height increases to accommodate the list

#### Scenario: Collapse config files
- **WHEN** the user clicks the expanded "View Configs" button
- **THEN** the config file list collapses
- **AND** the button returns to collapsed state (▶ icon)
- **AND** the card height returns to base compact size

#### Scenario: View individual config file
- **WHEN** config files are expanded and user clicks a config file eye icon
- **THEN** the selected config file opens in the ConfigFileViewer modal
- **AND** the card remains expanded to show the config list
- **AND** closing the viewer returns to the card with configs still expanded

### Requirement: Installation Method Indicator
The system SHALL display the default installation method as a compact badge with tooltip.

#### Scenario: Show Homebrew installation method
- **WHEN** a tool's default install method is Homebrew
- **THEN** a badge with Beer icon and "Brew" text appears next to the status badge
- **AND** the badge uses outline variant with subtle styling
- **AND** hovering shows tooltip: "Install via Homebrew"

#### Scenario: Show DMG installation method
- **WHEN** a tool's default install method is DMG download
- **THEN** a badge with Package icon and "DMG" text appears next to the status badge
- **AND** the badge uses outline variant with subtle styling
- **AND** hovering shows tooltip: "Download DMG Installer"

#### Scenario: No install method badge when installed
- **WHEN** a tool is already installed
- **THEN** the install method badge is not displayed
- **AND** only the status badge shows "Installed"

#### Scenario: No install method badge when no methods available
- **WHEN** a tool has no installation methods defined
- **THEN** no install method badge is displayed
- **AND** the install button shows disabled state

### Requirement: Compact Status Display
The system SHALL display installation status using a compact badge with icon.

#### Scenario: Installed status badge
- **WHEN** a tool is installed
- **THEN** a green badge with CheckCircle icon and "Installed" text appears
- **AND** the badge uses subtle green styling (bg-green-500/10, text-green-600)
- **AND** badge height is 24px with small text (12px)

#### Scenario: Not installed status badge
- **WHEN** a tool is not installed
- **THEN** a gray badge with XCircle icon and "Not Installed" text appears
- **AND** the badge uses muted styling (bg-muted, text-muted-foreground)
- **AND** the install button appears next to the status badge

### Requirement: Page-Level Spacing Optimization
The system SHALL use reduced spacing throughout the CLI Tools page to maximize content visibility.

#### Scenario: Reduced page padding
- **WHEN** viewing the CLI Tools page
- **THEN** the page container uses 16px padding (p-4) instead of 24px
- **AND** content remains readable with the reduced padding

#### Scenario: Reduced card vertical spacing
- **WHEN** viewing multiple tool cards
- **THEN** the vertical gap between cards is 8px (space-y-2)
- **AND** cards remain visually distinct with proper borders

#### Scenario: Optimized scroll height calculation
- **WHEN** the ScrollArea height is calculated
- **THEN** the calculation accounts for reduced page padding
- **AND** the formula is approximately `h-[calc(100vh-140px)]` (reduced from 180px)

### Requirement: Responsive Layout Behavior
The system SHALL adapt the horizontal card layout for narrower screens while maintaining information density.

#### Scenario: Medium screens (900-1200px)
- **WHEN** viewing on a medium screen
- **THEN** the horizontal layout remains intact
- **AND** template ID badge may be hidden if space is constrained
- **AND** dependency badges wrap if needed

#### Scenario: Narrow screens (600-900px)
- **WHEN** viewing on a narrow screen
- **THEN** the left group (tool identity) and right group (actions) stack vertically
- **AND** dependency badges remain in a centered row
- **AND** the layout uses flex-wrap to accommodate stacking

#### Scenario: Very narrow screens (< 600px)
- **WHEN** viewing on a very narrow screen
- **THEN** all groups stack vertically
- **AND** the layout resembles a more traditional card but remains compact
- **AND** spacing between stacked elements is minimal (4-8px)

### Requirement: Sidebar Collapse Layout Fix
The system SHALL ensure the sidebar collapse button does not reserve horizontal space in the main content area.

#### Scenario: Main content uses full available width
- **WHEN** the sidebar is in either collapsed or expanded state
- **THEN** the main content area extends to the sidebar boundary
- **AND** no gap or reserved space appears between sidebar and main content
- **AND** the main content has `min-w-0` class to allow proper flex shrinkage

#### Scenario: Smooth width transition on sidebar toggle
- **WHEN** the user toggles the sidebar collapse state
- **THEN** the main content width animates smoothly to fill new available space
- **AND** the transition completes within 300ms
- **AND** ScrollArea components recalculate their width after transition

#### Scenario: No horizontal overflow
- **WHEN** the sidebar toggles between states
- **THEN** no horizontal scrollbar appears
- **AND** content properly reflows to fit the new width
- **AND** tool cards maintain their layout integrity

