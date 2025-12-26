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

#### Scenario: Settings keyboard shortcut
- **WHEN** the user presses Cmd+, (macOS) or Ctrl+, (Windows/Linux)
- **THEN** the system navigates to the settings page
- **AND** the settings page becomes the active tab
- **AND** the settings content is displayed in the main panel
- **AND** the shortcut works from any page in the application
- **AND** the shortcut does not trigger when typing in text input fields

