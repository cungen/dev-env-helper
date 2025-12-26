## ADDED Requirements

### Requirement: Restore Page Display
The system SHALL provide a dedicated restore page that displays imported environment tools and software in separate sections based on installation status. Installed items SHALL display with minimal information, while not-installed items SHALL display with full information and installation controls.

#### Scenario: Navigate to restore page after import (no auto-installation)
- **WHEN** a user successfully uploads and validates an environment backup file
- **THEN** the system automatically navigates to the restore page
- **AND** displays all tools and software from the imported environment in separate sections
- **AND** installed items are displayed in an "Installed" section with minimal information (icon, name, installed badge)
- **AND** not-installed items are displayed in an "Available for Installation" section with full information
- **AND** does NOT automatically install any tools or software
- **AND** users can view which tools and software are already installed on their system
- **AND** users can manually choose which tools and software to install

#### Scenario: Restore page separated layout
- **WHEN** the restore page is displayed
- **THEN** items are separated into two distinct sections:
  - **Installed section**: Shows items already installed on the system
    - Displays items in a compact grid layout
    - Each item shows: icon, name, installed badge only
    - Does NOT show: install button, selection checkbox, type badge, date, description
    - Uses minimal card styling (reduced padding, compact layout)
  - **Available for Installation section**: Shows items not yet installed
    - Displays items in a responsive grid (2-4 columns based on screen width)
    - Each item shows: icon, name, type indicator, export date, installation status, selection checkbox, install button
    - Shows description for software items
    - Uses full card styling with all details
- **AND** sections have clear headers ("Installed" and "Available for Installation")
- **AND** sections are visually separated (dividers, spacing, or background differences)
- **AND** item counts are displayed in section headers (e.g., "Installed (5)", "Available for Installation (12)")

#### Scenario: View restore page directly
- **WHEN** a user navigates to the restore page via sidebar
- **THEN** if restore data exists from a previous import, the page displays the imported tools and software in separated sections
- **AND** if no restore data exists, the page shows a message prompting the user to import an environment file
- **AND** if all items are installed, only the "Installed" section is shown
- **AND** if no items are installed, only the "Available for Installation" section is shown

#### Scenario: Installed items minimal display
- **WHEN** a tool or software in the restore page is already installed on the system
- **THEN** the item is displayed in the "Installed" section
- **AND** the card shows only: icon, name, and version (for tools) or category (for software)
- **AND** the card does NOT show: install button, selection checkbox, type badge, export date, description, or installed badge
- **AND** the card uses compact styling (reduced padding, smaller height)
- **AND** the card is displayed in a more compact grid (more columns, smaller cards)
- **AND** the user can still identify what is installed

#### Scenario: Not-installed items full display
- **WHEN** a tool or software in the restore page is not yet installed on the system
- **THEN** the item is displayed in the "Available for Installation" section
- **AND** the card shows all information: icon, name, type indicator, export date, installation status, selection checkbox, install button
- **AND** software items also show description
- **AND** the card uses full styling with all details
- **AND** the user can select the item for batch installation
- **AND** the user can install the item individually

#### Scenario: Items move between sections after installation
- **WHEN** a user installs an item from the "Available for Installation" section
- **AND** the installation completes successfully
- **THEN** the item is removed from the "Available for Installation" section
- **AND** the item appears in the "Installed" section with minimal display
- **AND** the section headers update to reflect new counts
- **AND** the item can no longer be selected for batch installation

### Requirement: Manual Tool and Software Installation from Restore Page
The system SHALL allow users to manually install individual tools and software from the restore page, or select multiple items for batch installation. Installation is user-initiated only—no automatic installation occurs.

#### Scenario: User manually installs tool from restore page
- **WHEN** a user clicks the install button on a tool card in the "Available for Installation" section
- **THEN** the system initiates the installation process for that tool
- **AND** uses the same installation methods and flow as the CLI Tools page
- **AND** shows installation progress indicators
- **AND** when installation completes, the tool moves to the "Installed" section with minimal display
- **AND** only the tool the user clicked is installed

#### Scenario: User manually installs software from restore page
- **WHEN** a user clicks the install button on a software card in the "Available for Installation" section
- **THEN** the system initiates the installation process for that software
- **AND** uses the same installation methods and flow as the Software Recommendations page
- **AND** shows installation progress indicators
- **AND** when installation completes, the software moves to the "Installed" section with minimal display
- **AND** only the software the user clicked is installed

### Requirement: Multiple Selection and Batch Installation
The system SHALL allow users to select multiple tools and software items and install them all at once. Only items in the "Available for Installation" section can be selected.

#### Scenario: Select multiple items for batch installation
- **WHEN** a user checks the selection checkbox on multiple tool and software cards in the "Available for Installation" section
- **THEN** the system tracks which items are selected
- **AND** displays a "Install Selected (N)" button showing the count of selected items
- **AND** items in the "Installed" section cannot be selected (no checkboxes shown)
- **AND** selected items are visually highlighted or marked

#### Scenario: Batch install selected tools and software
- **WHEN** a user has selected multiple tools and software items from the "Available for Installation" section
- **AND** clicks the "Install Selected" button
- **THEN** the system resolves dependencies for all selected tools
- **AND** displays a preview or confirmation showing all items that will be installed
- **AND** shows installation order (dependencies first, then tools, then software)
- **AND** waits for user confirmation before proceeding
- **WHEN** the user confirms
- **THEN** the system installs all selected items in the correct order
- **AND** shows progress for each item being installed
- **AND** when each item completes, it moves to the "Installed" section
- **AND** shows success message when all installations complete

#### Scenario: Batch install with dependencies
- **WHEN** a user selects multiple tools for batch installation from the "Available for Installation" section
- **AND** some tools have dependencies
- **THEN** the system resolves all dependencies across all selected tools
- **AND** includes dependencies in the installation queue
- **AND** installs dependencies before dependent tools
- **AND** avoids duplicate installation if a dependency is already selected
- **AND** installed dependencies move to the "Installed" section when complete

#### Scenario: Cancel batch installation
- **WHEN** a user has selected multiple items from the "Available for Installation" section
- **AND** clicks cancel or deselects all items
- **THEN** the selection is cleared
- **AND** the "Install Selected" button is hidden
- **AND** all checkboxes return to unchecked state

#### Scenario: No automatic installation during import
- **WHEN** a user imports an environment backup file
- **THEN** the system loads and displays the imported tools on the restore page in separated sections
- **AND** does NOT automatically install any tools
- **AND** all tools remain available for the user to review and selectively install

#### Scenario: Install tool with dependencies
- **WHEN** a user installs a tool from the "Available for Installation" section that has dependencies
- **THEN** the system resolves and installs dependencies first
- **AND** shows the dependency installation queue
- **AND** proceeds with tool installation after dependencies are complete
- **AND** installed dependencies appear in the "Installed" section

#### Scenario: Tool or software already installed
- **WHEN** a tool or software in the restore page is already installed on the system
- **THEN** the item appears in the "Installed" section with minimal display
- **AND** the item shows only icon, name, and version (for tools) or category (for software)
- **AND** the item does NOT show install button or selection checkbox
- **AND** the item cannot be selected for batch installation
- **AND** the user can clearly see which tools and software are already installed vs. available for installation

### Requirement: Restore Page Title Bar and Actions
The system SHALL display a title bar with page title and action buttons when restore data is loaded. The title bar SHALL provide quick access to reset the restore data and re-upload a new environment file.

#### Scenario: Title bar displayed when restore data exists
- **WHEN** a user has uploaded and imported an environment backup file
- **AND** the restore page is displayed
- **THEN** a title bar is shown at the top of the page
- **AND** the title bar displays "Restore Environment" as the page title
- **AND** the title bar displays two action buttons on the right side: "Reset" and "Re-upload"
- **AND** the title bar is positioned above all content sections

#### Scenario: Reset restore data
- **WHEN** a user clicks the "Reset" button in the title bar
- **THEN** the system clears all restore data from storage
- **AND** the restore page displays the empty state
- **AND** the title bar and action buttons are hidden
- **AND** the user is prompted to import a new environment file

#### Scenario: Re-upload environment file
- **WHEN** a user clicks the "Re-upload" button in the title bar
- **THEN** the system opens a file picker dialog
- **AND** the file picker accepts JSON files only
- **WHEN** the user selects a valid environment backup file
- **THEN** the system validates and imports the new file
- **AND** replaces the existing restore data with the new data
- **AND** updates the restore page to display the new imported items
- **AND** the title bar remains visible with the same actions

#### Scenario: Title bar hidden when no restore data
- **WHEN** no restore data exists (no file has been uploaded)
- **THEN** the title bar is NOT displayed
- **AND** the empty state is shown instead
- **AND** the user can upload a file from the empty state

