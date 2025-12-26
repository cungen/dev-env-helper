## MODIFIED Requirements

### Requirement: Sidebar Navigation
The system SHALL provide a vertical sidebar for navigating between application features.

#### Scenario: Sidebar displays available features
- **WHEN** the application launches
- **THEN** the system displays a vertical sidebar on the left side of the window
- **AND** shows a tab/button for each available feature (Home, CLI Tools, Software, Settings, Restore, and future features)
- **AND** each tab displays an icon and label
- **AND** the currently active tab is visually highlighted

#### Scenario: Switch between features
- **WHEN** the user clicks on a sidebar tab
- **THEN** the main content area updates to show the selected feature
- **AND** the active tab indicator moves to the newly selected tab
- **AND** the feature's content is displayed in the main panel

#### Scenario: Keyboard navigation
- **WHEN** the user uses keyboard shortcuts (if implemented)
- **THEN** the system allows switching between features without mouse interaction
- **AND** maintains consistent keyboard patterns (e.g., Ctrl/Cmd + number keys)

## ADDED Requirements

### Requirement: Programmatic Navigation
The system SHALL support programmatic navigation to specific tabs from application code.

#### Scenario: Navigate to tab programmatically
- **WHEN** application code calls the navigation function to switch to a specific tab
- **THEN** the system updates the active tab
- **AND** displays the content for that tab
- **AND** updates the sidebar to highlight the new active tab
- **AND** persists the navigation state

#### Scenario: Navigate after import
- **WHEN** an environment file is successfully imported
- **THEN** the system can programmatically navigate to the restore page
- **AND** the restore page displays the imported environment data

