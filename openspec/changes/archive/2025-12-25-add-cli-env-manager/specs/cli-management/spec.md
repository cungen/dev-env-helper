## ADDED Requirements

### Requirement: CLI Tool Detection
The system SHALL automatically detect installed CLI tools and display their status.

#### Scenario: Successful detection of installed tools
- **WHEN** the application starts or user triggers a refresh
- **THEN** the system scans PATH for known CLI executables
- **AND** displays each tool with its installation status (installed/not installed)
- **AND** shows the detected version for installed tools
- **AND** shows the executable path for installed tools
- **AND** shows dependency count badge for tools with dependencies

#### Scenario: Tool not found on system
- **WHEN** a CLI tool from the built-in list is not found in PATH
- **THEN** the system displays the tool as "Not Installed"
- **AND** shows an "Install" button if installation methods are defined
- **AND** shows installation guidance or documentation link if no install method available

#### Scenario: Manual refresh of tool status
- **WHEN** the user clicks a "Refresh" button
- **THEN** the system re-scans all CLI tools
- **AND** updates the UI with current detection results
- **AND** displays a loading indicator during scanning

#### Scenario: Detection failure handled gracefully
- **WHEN** CLI detection encounters an error (permission denied, timeout, etc.)
- **THEN** the system displays the tool in an "Error" state
- **AND** shows an error message with actionable details
- **AND** continues detection of remaining tools

### Requirement: CLI Tool Configuration Management
The system SHALL allow users to view and manage configuration files for each CLI tool.

#### Scenario: View known config file locations
- **WHEN** the user selects a CLI tool
- **THEN** the system displays known configuration file locations for that tool
- **AND** shows existence status for each config file (exists/missing)
- **AND** indicates whether the file is readable

#### Scenario: View config file content
- **WHEN** the user clicks on an existing configuration file
- **THEN** the system displays the file contents in a readable format
- **AND** handles common file types appropriately (text, JSON, YAML, TOML)

#### Scenario: Config file not accessible
- **WHEN** the user attempts to view a config file that is missing or unreadable
- **THEN** the system displays an appropriate error message
- **AND** indicates the reason (file not found, permission denied)

### Requirement: Custom CLI Tool Templates
The system SHALL allow users to extend CLI tool support through a template system.

#### Scenario: Add custom CLI tool
- **WHEN** the user creates a new CLI tool template
- **THEN** the system prompts for required fields (id, name, executable name, version command)
- **AND** allows optional installation methods (brew cask name, DMG URL)
- **AND** allows optional dependency declarations (list of tool IDs)
- **AND** validates dependencies reference existing tool IDs
- **AND** validates no circular dependencies would be created
- **AND** saves the template to the user's custom tools configuration
- **AND** includes the custom tool in subsequent detection scans

#### Scenario: Edit existing custom tool
- **WHEN** the user modifies an existing custom tool template
- **THEN** the system updates the stored template
- **AND** re-runs detection for that tool
- **AND** reflects changes in the UI

#### Scenario: Delete custom tool
- **WHEN** the user removes a custom tool template
- **THEN** the system deletes the template from configuration
- **AND** removes the tool from the UI
- **AND** shows a confirmation dialog before deletion

#### Scenario: Template validation
- **WHEN** the user saves a template with invalid or missing required fields
- **THEN** the system displays validation errors
- **AND** prevents saving until errors are resolved
- **AND** highlights the specific fields requiring correction
- **AND** validates dependency references exist
- **AND** checks for circular dependencies in the dependency chain

### Requirement: Built-in CLI Tool Templates
The system SHALL ship with pre-configured templates for common development CLI tools.

#### Scenario: Default tool templates available
- **WHEN** the application is first launched
- **THEN** the system includes templates for Node.js (node/npm), Python (python/pip), uv, and n
- **AND** these templates are automatically used for detection
- **AND** users cannot modify built-in templates directly

#### Scenario: Override built-in tool with custom version
- **WHEN** the user creates a custom template with the same id as a built-in tool
- **THEN** the system uses the custom template in place of the built-in
- **AND** indicates the tool is customized in the UI
