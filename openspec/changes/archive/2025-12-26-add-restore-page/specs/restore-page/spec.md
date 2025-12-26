## ADDED Requirements

### Requirement: Restore Page Display
The system SHALL provide a dedicated restore page that displays imported environment tools and software in a grid layout similar to App Store's "My Apps" section.

#### Scenario: Navigate to restore page after import (no auto-installation)
- **WHEN** a user successfully uploads and validates an environment backup file
- **THEN** the system automatically navigates to the restore page
- **AND** displays all tools and software from the imported environment in a grid layout
- **AND** shows tool/software icons, names, export dates, and installation status
- **AND** does NOT automatically install any tools or software
- **AND** users can view which tools and software are already installed on their system
- **AND** users can manually choose which tools and software to install

#### Scenario: Restore page grid layout
- **WHEN** the restore page is displayed
- **THEN** tools and software are arranged in a responsive grid (2-4 columns based on screen width)
- **AND** each item (tool or software) is displayed as a card with:
  - Item icon (tool icon, software emoji, or placeholder if no icon available)
  - Item name
  - Item type indicator (CLI Tool or Software)
  - Export date from the backup file
  - Installation status indicator
  - Selection checkbox (for batch installation, disabled if already installed)
  - Install/download button (if not already installed)

#### Scenario: View restore page directly
- **WHEN** a user navigates to the restore page via sidebar
- **THEN** if restore data exists from a previous import, the page displays the imported tools and software
- **AND** if no restore data exists, the page shows a message prompting the user to import an environment file

### Requirement: Manual Tool and Software Installation from Restore Page
The system SHALL allow users to manually install individual tools and software from the restore page, or select multiple items for batch installation. Installation is user-initiated only—no automatic installation occurs.

#### Scenario: User manually installs tool from restore page
- **WHEN** a user clicks the install button on a tool card in the restore page
- **THEN** the system initiates the installation process for that tool
- **AND** uses the same installation methods and flow as the CLI Tools page
- **AND** shows installation progress indicators
- **AND** updates the tool card to show installed status when complete
- **AND** only the tool the user clicked is installed

#### Scenario: User manually installs software from restore page
- **WHEN** a user clicks the install button on a software card in the restore page
- **THEN** the system initiates the installation process for that software
- **AND** uses the same installation methods and flow as the Software Recommendations page
- **AND** shows installation progress indicators
- **AND** updates the software card to show installed status when complete
- **AND** only the software the user clicked is installed

### Requirement: Multiple Selection and Batch Installation
The system SHALL allow users to select multiple tools and software items and install them all at once.

#### Scenario: Select multiple items for batch installation
- **WHEN** a user checks the selection checkbox on multiple tool and software cards
- **THEN** the system tracks which items are selected
- **AND** displays a "Install Selected (N)" button showing the count of selected items
- **AND** already-installed items cannot be selected (checkboxes disabled)
- **AND** selected items are visually highlighted or marked

#### Scenario: Batch install selected tools and software
- **WHEN** a user has selected multiple tools and software items
- **AND** clicks the "Install Selected" button
- **THEN** the system resolves dependencies for all selected tools
- **AND** displays a preview or confirmation showing all items that will be installed
- **AND** shows installation order (dependencies first, then tools, then software)
- **AND** waits for user confirmation before proceeding
- **WHEN** the user confirms
- **THEN** the system installs all selected items in the correct order
- **AND** shows progress for each item being installed
- **AND** updates each card to show installed status when its installation completes
- **AND** shows success message when all installations complete

#### Scenario: Batch install with dependencies
- **WHEN** a user selects multiple tools for batch installation
- **AND** some tools have dependencies
- **THEN** the system resolves all dependencies across all selected tools
- **AND** includes dependencies in the installation queue
- **AND** installs dependencies before dependent tools
- **AND** avoids duplicate installation if a dependency is already selected

#### Scenario: Cancel batch installation
- **WHEN** a user has selected multiple items
- **AND** clicks cancel or deselects all items
- **THEN** the selection is cleared
- **AND** the "Install Selected" button is hidden
- **AND** all checkboxes return to unchecked state

#### Scenario: No automatic installation during import
- **WHEN** a user imports an environment backup file
- **THEN** the system loads and displays the imported tools on the restore page
- **AND** does NOT automatically install any tools
- **AND** all tools remain available for the user to review and selectively install

#### Scenario: Install tool with dependencies
- **WHEN** a user installs a tool from the restore page that has dependencies
- **THEN** the system resolves and installs dependencies first
- **AND** shows the dependency installation queue
- **AND** proceeds with tool installation after dependencies are complete

#### Scenario: Tool or software already installed
- **WHEN** a tool or software in the restore page is already installed on the system
- **THEN** the card shows an "Installed" indicator (checkmark or badge)
- **AND** the install button is disabled or replaced with an "Installed" status
- **AND** the selection checkbox is disabled (cannot be selected for batch installation)
- **AND** the card may have different styling to indicate installed status
- **AND** the user can clearly see which tools and software are already installed vs. available for installation

### Requirement: Restore Data Persistence
The system SHALL persist imported environment data so users can return to the restore page.

#### Scenario: Restore data persists across navigation
- **WHEN** a user imports an environment file and navigates to the restore page
- **THEN** the imported environment data (tools and software) is stored
- **AND** if the user navigates away from the restore page
- **AND** later returns to the restore page
- **THEN** the restore page still displays the imported tools and software

#### Scenario: New import replaces previous restore data
- **WHEN** a user imports a new environment file while restore data already exists
- **THEN** the new import data replaces the previous restore data
- **AND** the restore page updates to show tools and software from the new import
- **AND** navigation to restore page occurs automatically

#### Scenario: Clear restore data
- **WHEN** a user wants to clear the restore page data
- **THEN** the system provides a way to clear the restore data (button or action)
- **AND** after clearing, the restore page shows the empty state message

### Requirement: Restore Page Empty State
The system SHALL display an appropriate message when no restore data is available.

#### Scenario: No restore data available
- **WHEN** a user navigates to the restore page and no environment has been imported
- **THEN** the page displays a message indicating no restore data is available
- **AND** provides a button or link to import an environment file
- **AND** explains that imported tools and software will appear on this page

